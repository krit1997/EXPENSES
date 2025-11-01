import { Injectable, Logger } from '@nestjs/common';
import { LineRepository } from '../../../repositories/line-repository/line-repository.service';
import { SheetsRepository } from '../../../repositories/sheets-repository/sheets-repository.service';
import { BuildConfirmMessageUsecaseService } from '../build-confirm-message-usecase/build-confirm-message-usecase.service';
import { ExtracTextFromImageBufferUsecaseService } from '../extrac-text-from-image-buffer-usecase/extrac-text-from-image-buffer-usecase.service';
import { ParseSlipTextUsecaseService } from '../parse-slip-text-usecase/parse-slip-text-usecase.service';
import { ReadImageBufferUsecaseService } from '../read-image-buffer-usecase/read-image-buffer-usecase.service';
import { Parsed } from '../types';

@Injectable()
export class HandleSlipUsecaseService {
  private readonly logger = new Logger(HandleSlipUsecaseService.name);
  constructor(
    private readonly readImageBuffer: ReadImageBufferUsecaseService,
    private readonly extractTextFromImageBuffer: ExtracTextFromImageBufferUsecaseService,
    private readonly parseSlip: ParseSlipTextUsecaseService,
    private readonly sheetsRepo: SheetsRepository,
    private readonly lineRepo: LineRepository,
    private readonly buildConfirmMessage: BuildConfirmMessageUsecaseService,
  ) {}

  // Public entry used by LineService
  async execute(ev: unknown): Promise<Parsed> {
    const maybeEvt = ev as
      | { source?: { userId?: string }; message?: { id?: string } }
      | undefined;
    const userId = maybeEvt?.source?.userId;
    const messageId = maybeEvt?.message?.id;
    if (!userId || !messageId) throw new Error('Unsupported image event');
    const imgBuf = await this.readImageBuffer.execute(messageId);
    const rawText = await this.extractTextFromImageBuffer.execute(imgBuf);
    const parsed = await this.parseSlip.execute(rawText);

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
        { type: 'text', text: await this.buildConfirmMessage.execute(parsed) },
      ]);
    } catch (err) {
      this.logger.error('[LINE pushMessage] ' + String(err));
    }
    return parsed;
  }
}
