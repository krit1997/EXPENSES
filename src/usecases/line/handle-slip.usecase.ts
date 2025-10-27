import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';

import { LineRepository } from '../../repositories/line-repository/line-repository.service';
import { SheetsRepository } from '../../repositories/sheets-repository/sheets-repository.service';
import { VisionRepository } from '../../repositories/vision-repository/vision-repository.service';
import type { Parsed } from './parse-slip.usecase';
import { ParseSlipUsecase } from './parse-slip.usecase';

@Injectable()
export class HandleSlipUsecase {
  constructor(
    private readonly lineRepo: LineRepository,
    private readonly visionRepo: VisionRepository,
    private readonly sheetsRepo: SheetsRepository,
    private readonly parseSlip: ParseSlipUsecase,
  ) {}

  private readonly logger = new Logger(HandleSlipUsecase.name);

  // Public entry used by LineService
  async execute(ev: unknown): Promise<Parsed> {
    const maybeEvt = ev as
      | { source?: { userId?: string }; message?: { id?: string } }
      | undefined;
    const userId = maybeEvt?.source?.userId;
    const messageId = maybeEvt?.message?.id;
    if (!userId || !messageId) throw new Error('Unsupported image event');
    const imgBuf = await this.readImageBuffer(messageId);
    const rawText = await this.extractTextFromImageBuffer(imgBuf);
    const parsed = this.parseSlip.parseSlipText(rawText);

    try {
      await this.sheetsRepo.appendRow([
        (parsed.when ?? new Date()).toISOString(),
        userId,
        '',
        rawText,
        parsed.type ?? '',
        parsed.category ?? '',
        parsed.subcategory ?? '',
        parsed.item ?? 'จ่ายผ่านสลิป',
        parsed.amount ?? null,
      ]);
    } catch (err) {
      this.logger.error('[Sheets appendRow] ' + String(err));
    }

    try {
      await this.lineRepo.pushMessage(userId, [
        { type: 'text', text: this.parseSlip.buildConfirmMessage(parsed) },
      ]);
    } catch (err) {
      this.logger.error('[LINE pushMessage] ' + String(err));
    }
    return parsed;
  }

  private async readImageBuffer(messageId: string): Promise<Buffer> {
    const stream = await this.lineRepo.getMessageContent(messageId);
    const chunks: Buffer[] = [];
    try {
      for await (const c of stream as AsyncIterable<unknown>) {
        if (typeof c === 'string') chunks.push(Buffer.from(c));
        else if (Buffer.isBuffer(c)) chunks.push(c);
        else if (c instanceof Uint8Array) chunks.push(Buffer.from(c));
      }
    } catch (err) {
      this.logger.error('Failed reading message content: ' + String(err));
      throw err;
    }
    return Buffer.concat(chunks);
  }

  private async extractTextFromImageBuffer(imgBuf: Buffer): Promise<string> {
    const preprocessed = await sharp(imgBuf)
      .grayscale()
      .resize({ width: 1800, withoutEnlargement: true })
      .sharpen()
      .toBuffer();

    const visionRes = await this.visionRepo.documentTextDetection(preprocessed);
    let rawText = '';
    if (Array.isArray(visionRes) && visionRes.length > 0) {
      const res0 = visionRes[0];
      if (res0 && typeof res0 === 'object') {
        const f = (res0 as { fullTextAnnotation?: unknown }).fullTextAnnotation;
        if (f && typeof f === 'object') {
          const text = (f as { text?: unknown }).text;
          if (typeof text === 'string') rawText = text;
        }
      }
    }
    return rawText;
  }
}
