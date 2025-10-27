import { validateSignature } from '@line/bot-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { LineRepository } from '../../repositories/line-repository/line-repository.service';
import { GuessCategoryUsecase } from './guess-category.usecase';
import { GuessTypeUsecase } from './guess-type.usecase';
import { HandleSlipUsecase } from './handle-slip.usecase';
import { ParseTextUsecase } from './parse-text.usecase';
import { ParseWhenUsecase } from './parse-when.usecase';
import { SaveSlipUsecase } from './save-slip.usecase';

@Injectable()
export class HandleWebhookUsecase {
  constructor(
    private readonly lineRepo: LineRepository,
    private readonly handleSlipUsecase: HandleSlipUsecase,
    private readonly parseTextUsecase: ParseTextUsecase,
    private readonly parseWhenUsecase: ParseWhenUsecase,
    private readonly guessTypeUsecase: GuessTypeUsecase,
    private readonly guessCategoryUsecase: GuessCategoryUsecase,
    private readonly saveSlipUsecase: SaveSlipUsecase,
  ) {}

  private readonly logger = new Logger(HandleWebhookUsecase.name);

  private isObject(x: unknown): x is Record<string, unknown> {
    return typeof x === 'object' && x !== null;
  }

  private isUserMessageEvent(ev: unknown): ev is {
    type: 'message';
    source: { type: 'user'; userId: string };
    replyToken: string;
    message?: unknown;
  } {
    if (!this.isObject(ev)) return false;
    const t = ev['type'];
    if (t !== 'message') return false;
    const src = ev['source'];
    if (!this.isObject(src)) return false;
    if (src['type'] !== 'user') return false;
    const rt = ev['replyToken'];
    if (typeof rt !== 'string') return false;
    return true;
  }

  private isImageMessage(msg: unknown): msg is { type: 'image' } {
    return this.isObject(msg) && msg['type'] === 'image';
  }

  private isTextMessage(msg: unknown): msg is { type: 'text'; text: string } {
    return (
      this.isObject(msg) &&
      msg['type'] === 'text' &&
      typeof msg['text'] === 'string'
    );
  }

  async execute(
    bodyBuf: unknown,
    signature?: string,
  ): Promise<{ status: number; body: string }> {
    const buf = bodyBuf as Buffer | undefined;
    if (!signature) return { status: 200, body: 'OK (no signature)' };
    if (!buf) return { status: 400, body: 'Bad Request (no body)' };
    const bodyText = buf.toString('utf8');

    const secret = process.env.LINE_CHANNEL_SECRET ?? '';
    if (!this.validateSignatureSafe(bodyText, secret, signature))
      return { status: 401, body: 'invalid signature' };

    const events = this.parseEventsSafe(bodyText);
    if (events.length === 0) return { status: 200, body: 'OK (no events)' };

    const replyTasks: Promise<any>[] = [];
    const sideTasks: Promise<any>[] = [];

    for (const ev of events) {
      if (!this.isUserMessageEvent(ev)) continue;
      try {
        this.handleEvent(ev, replyTasks, sideTasks);
      } catch (err) {
        this.logger.error('Failed handling event', String(err));
      }
    }

    await Promise.allSettled(replyTasks);
    await Promise.allSettled(sideTasks);
    return { status: 200, body: 'OK' };
  }

  private validateSignatureSafe(
    bodyText: string,
    secret: string,
    signature: string,
  ): boolean {
    try {
      return validateSignature(bodyText, secret, signature);
    } catch (err) {
      this.logger.warn('Signature validation failed: ' + String(err));
      return false;
    }
  }

  private parseEventsSafe(bodyText: string): unknown[] {
    try {
      const body = JSON.parse(bodyText) as unknown;
      if (this.isObject(body)) {
        const rec = body;
        if (Array.isArray(rec['events'])) return rec['events'] as unknown[];
      }
      return [];
    } catch (err) {
      this.logger.warn('Invalid JSON in webhook body: ' + String(err));
      return [];
    }
  }

  private handleEvent(
    ev: {
      type: 'message';
      source: { type: 'user'; userId: string };
      replyToken: string;
      message?: unknown;
    },
    replyTasks: Promise<any>[],
    sideTasks: Promise<any>[],
  ) {
    const msg = ev.message;
    if (this.isImageMessage(msg)) {
      replyTasks.push(
        this.lineRepo
          .replyMessage(ev.replyToken, [
            { type: 'text', text: 'รับสลิปแล้ว กำลังอ่านข้อความจากภาพ… 🧾' },
          ])
          .catch((e) => this.logger.error('Reply failed: ' + String(e))),
      );
      sideTasks.push(
        this.handleSlipUsecase
          .execute(ev)
          .catch((e) => this.logger.error('Handle slip failed: ' + String(e))),
      );
      return;
    }

    if (this.isTextMessage(msg)) {
      const rawText = String(msg['text'] ?? '');
      const parsed = this.parseTextUsecase.execute(rawText);
      const { item, amount } = parsed;
      const type = this.guessTypeUsecase.execute(rawText, amount ?? null);
      const { category, subcategory } =
        this.guessCategoryUsecase.execute(rawText);
      const when = this.parseWhenUsecase.execute(rawText);

      let typeLabel = '';
      if (amount != null) {
        if (type === 'income') typeLabel = 'รายรับ';
        else if (type === 'expense') typeLabel = 'รายจ่าย';
        else typeLabel = 'ไม่ทราบประเภท';
      }

      let replyMessage: { type: 'text'; text: string };
      if (amount == null) {
        replyMessage = {
          type: 'text',
          text: 'รับข้อความแล้ว แต่ยังหา “จำนวนเงิน” ไม่เจอ (เช่น "กาแฟ 45")',
        };
      } else {
        replyMessage = {
          type: 'text',
          text: `บันทึกแล้ว: ${item ?? '(ไม่ทราบรายการ)'} = ${amount} (${typeLabel})`,
        };
      }

      replyTasks.push(
        this.lineRepo
          .replyMessage(ev.replyToken, [replyMessage])
          .catch((e) => this.logger.error('Reply failed: ' + String(e))),
      );

      sideTasks.push(
        (async () => {
          let displayName = '';
          try {
            const p = await this.lineRepo.getProfile(ev.source.userId);
            if (p && typeof p === 'object') {
              const pRec = p as Record<string, unknown>;
              const maybeDisplay = pRec['displayName'];
              if (typeof maybeDisplay === 'string') displayName = maybeDisplay;
            }
          } catch (err) {
            this.logger.warn('[LINE PROFILE ERROR] ' + String(err));
          }

          try {
            await this.saveSlipUsecase.execute([
              (when ?? new Date()).toISOString(),
              ev.source.userId,
              displayName,
              rawText,
              type ?? '',
              category ?? '',
              subcategory ?? '',
              item ?? '',
              amount ?? null,
            ]);
          } catch (e) {
            this.logger.error('[SaveToSheet ERROR] ' + String(e));
          }
        })(),
      );

      return;
    }

    // other types
    replyTasks.push(
      this.lineRepo
        .replyMessage(ev.replyToken, [
          {
            type: 'text',
            text: 'ตอนนี้รองรับเฉพาะข้อความและรูปสลิปเท่านั้นนะครับ 📄',
          },
        ])
        .catch((e) => this.logger.error('Reply failed: ' + String(e))),
    );
  }
}
