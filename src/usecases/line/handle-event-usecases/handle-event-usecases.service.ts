import { Injectable, Logger } from '@nestjs/common';
import { LineRepository } from '../../../repositories/line-repository/line-repository.service';
import { GuessCategoryUsecaseService } from '../guess-category-usecase/guess-category-usecase.service';
import { GuessTypeUsecaseService } from '../guess-type-usecase/guess-type-usecase.service';
import { HandleSlipUsecaseService } from '../handle-slip-usecase/handle-slip-usecase.service';
import { ParseTextUsecaseService } from '../parse-text-usecase/parse-text-usecase.service';
import { ParseWhenUsecaseService } from '../parse-when-usecase/parse-when-usecase.service';
import { HandleEventRequest } from '../types';

@Injectable()
export class HandleEventUsecasesService {
  private readonly logger = new Logger(HandleEventUsecasesService.name);
  constructor(
    private readonly lineRepo: LineRepository,
    private readonly handleSlipUsecase: HandleSlipUsecaseService,
    private readonly parseTextUsecase: ParseTextUsecaseService,
    private readonly parseWhenUsecase: ParseWhenUsecaseService,
    private readonly guessTypeUsecaseService: GuessTypeUsecaseService,
    private readonly guessCategoryUsecaseService: GuessCategoryUsecaseService,
  ) {}

  async execute(request: HandleEventRequest) {
    const { ev, replyTasks, sideTasks } = request;
    const msg = ev.message || 'text';
    if (await this.isImageMessage(msg)) {
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

    if (await this.isTextMessage(msg)) {
      const rawText = String(msg['text'] ?? '');
      const parsed = await this.parseTextUsecase.execute(rawText);
      const type = await this.guessTypeUsecaseService.execute(
        rawText,
        parsed.amount ?? null,
      );
      const { category, subcategory } =
        await this.guessCategoryUsecaseService.execute(rawText);
      const when = await this.parseWhenUsecase.execute(rawText);

      let typeLabel = '';
      if (parsed.amount != null) {
        if (type === 'income') typeLabel = 'รายรับ';
        else if (type === 'expense') typeLabel = 'รายจ่าย';
        else typeLabel = 'ไม่ทราบประเภท';
      }

      let replyMessage: { type: 'text'; text: string };
      if (parsed.amount == null) {
        replyMessage = {
          type: 'text',
          text: 'รับข้อความแล้ว แต่ยังหา “จำนวนเงิน” ไม่เจอ (เช่น "กาแฟ 45")',
        };
      } else {
        replyMessage = {
          type: 'text',
          text: `บันทึกแล้ว: ${parsed.item ?? '(ไม่ทราบรายการ)'} = ${parsed.amount} (${typeLabel})`,
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

  private isImageMessage(msg: unknown): Promise<string | null> {
    return new Promise((resolve) => {
      if (
        msg &&
        typeof msg === 'object' &&
        'type' in msg &&
        msg['type'] === 'image'
      ) {
        resolve(msg['id']);
      } else {
        resolve(null);
      }
    });
  }

  private isTextMessage(msg: unknown): Promise<string | null> {
    return new Promise((resolve) => {
      if (
        msg &&
        typeof msg === 'object' &&
        'type' in msg &&
        msg['type'] === 'text' &&
        typeof msg['text'] === 'string'
      ) {
        resolve(msg['text']);
      } else {
        resolve(null);
      }
    });
  }
}
