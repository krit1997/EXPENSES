// src/modules/line/line.controller.ts
import { validateSignature } from '@line/bot-sdk';
import { Controller, Headers, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { LineService } from './line.service';

@Controller('webhook/line')
export class LineController {
  constructor(private readonly line: LineService) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('x-line-signature') signature?: string,
  ) {
    console.log('[LINE WEBHOOK] Received request');
    const bodyBuf = req.body as Buffer | undefined;

    // (A) ไม่มี signature → manual test
    if (!signature) {
      console.log('[Webhook] No signature header — manual test or ngrok ping.');
      return res.send('OK (no signature)');
    }

    if (!bodyBuf) return res.status(400).send('Bad Request (no body)');
    const bodyText = bodyBuf.toString('utf8');

    // (B) ตรวจลายเซ็น
    const secret = this.line.middlewareConfig.channelSecret;
    const ok = validateSignature(bodyText, secret, signature);
    if (!ok) return res.status(401).send('invalid signature');

    // (C) parse JSON
    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return res.status(400).send('Bad Request (invalid JSON)');
    }

    const events: any[] = body?.events ?? [];
    if (!Array.isArray(events) || events.length === 0)
      return res.send('OK (no events)');

    // (D) เตรียม task
    const replyTasks: Promise<any>[] = [];
    const sideTasks: Promise<any>[] = [];

    for (const ev of events) {
      if (ev?.type !== 'message' || ev?.source?.type !== 'user') continue;

      // --- 1️⃣ กรณี: รูปสลิป (image) ---
      if (ev?.message?.type === 'image') {
        replyTasks.push(
          this.line.client
            .replyMessage(ev.replyToken, [
              { type: 'text', text: 'รับสลิปแล้ว กำลังอ่านข้อความจากภาพ… 🧾' },
            ])
            .catch(this.line.logLineError),
        );

        // OCR + save (async)
        sideTasks.push(this.line.handleSlipImage(ev).catch(console.error));
        continue;
      }

      // --- 2️⃣ กรณี: ข้อความธรรมดา (text) ---
      if (ev?.message?.type === 'text') {
        const rawText: string = ev.message.text ?? '';
        const { item, amount } = this.line.parseText(rawText);
        const type = this.line.guessType(rawText, amount);
        const { category, subcategory } = this.line.guessCategory(rawText);
        const when = this.line.parseWhen(rawText);

        // เตรียมข้อความตอบกลับ
        const replyMessage = (() => {
          if (amount != null) {
            const typeLabel =
              type !== 'unknown'
                ? type === 'income'
                  ? 'รายรับ'
                  : 'รายจ่าย'
                : 'ไม่ทราบประเภท';
            return {
              type: 'text' as const,
              text: `บันทึกแล้ว: ${item ?? '(ไม่ทราบรายการ)'} = ${amount} (${typeLabel})`,
            };
          }
          return {
            type: 'text' as const,
            text: 'รับข้อความแล้ว แต่ยังหา “จำนวนเงิน” ไม่เจอ (เช่น "กาแฟ 45")',
          };
        })();

        // ตอบกลับเร็วที่สุด
        replyTasks.push(
          this.line.client
            .replyMessage(ev.replyToken, [replyMessage])
            .catch(this.line.logLineError),
        );

        // background: ดึงชื่อ user และบันทึกลงชีต
        sideTasks.push(
          (async () => {
            let displayName = '';
            try {
              const p = await this.line.client.getProfile(ev.source.userId);
              displayName = p.displayName;
            } catch (err) {
              console.error('[LINE PROFILE ERROR]', err);
            }

            try {
              await this.line.saveToSheet({
                userId: ev.source.userId,
                displayName,
                rawText,
                item,
                amount,
                type,
                category,
                subcategory,
                when,
              });
            } catch (e) {
              console.error('[SaveToSheet ERROR]', e);
            }
          })(),
        );

        continue;
      }

      // --- 3️⃣ กรณี: รูปแบบอื่น (file/video/audio) ---
      replyTasks.push(
        this.line.client
          .replyMessage(ev.replyToken, [
            {
              type: 'text',
              text: 'ตอนนี้รองรับเฉพาะข้อความและรูปสลิปเท่านั้นนะครับ 📄',
            },
          ])
          .catch(this.line.logLineError),
      );
    }

    // (E) ตอบ 200 ให้ LINE ก่อน (สำคัญ)
    res.send('OK');

    // (F) ทำ background tasks ต่อ
    await Promise.allSettled(replyTasks);
    await Promise.allSettled(sideTasks);
  }
}
