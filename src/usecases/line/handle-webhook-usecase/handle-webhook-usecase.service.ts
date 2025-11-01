import { Injectable, Logger } from '@nestjs/common';
import { HandleEventUsecasesService } from '../handle-event-usecases/handle-event-usecases.service';
import { IsUserMessageEventUsecaseService } from '../is-user-message-event-usecase/is-user-message-event-usecase.service';
import { ParseEventsSafeUsecaseService } from '../parse-events-safe-usecase/parse-events-safe-usecase.service';
import { HandleEventRequest, IsUserMessageEventRequest } from '../types';
import { ValidateSignatureUsecaseService } from '../validate-signature-usecase/validate-signature-usecase.service';

@Injectable()
export class HandleWebhookUsecaseService {
  private readonly logger = new Logger(HandleWebhookUsecaseService.name);
  constructor(
    private readonly validateSignatureSafe: ValidateSignatureUsecaseService,
    private readonly parseEventsSafe: ParseEventsSafeUsecaseService,
    private readonly isUserMessageEvent: IsUserMessageEventUsecaseService,
    private readonly handleEvent: HandleEventUsecasesService,
  ) {}
  async execute(
    bodyBuf: unknown,
    signature?: string,
  ): Promise<{ status: number; body: string }> {
    console.log(
      '🚀 ~ HandleWebhookUsecaseService ~ execute ~ bodyBuf:',
      bodyBuf,
    );
    const buf = bodyBuf as Buffer | undefined;
    if (!signature) return { status: 200, body: 'OK (no signature)' };
    if (!buf) return { status: 400, body: 'Bad Request (no body)' };
    const bodyText = buf.toString('utf8');
    console.log(
      '🚀 ~ HandleWebhookUsecaseService ~ execute ~ bodyText:',
      bodyText,
    );

    const secret = process.env.LINE_CHANNEL_SECRET ?? '';
    const requestValidateSignatureSafe = {
      bodyText,
      secret,
      signature,
    };
    if (
      !(await this.validateSignatureSafe.execute(requestValidateSignatureSafe))
    )
      return { status: 401, body: 'invalid signature' };

    const events = await this.parseEventsSafe.execute(bodyText);
    if (events.length === 0) return { status: 200, body: 'OK (no events)' };

    const replyTasks: Promise<any>[] = [];
    const sideTasks: Promise<any>[] = [];

    for (const ev of events) {
      const requestIsUserMessageEvent: IsUserMessageEventRequest = {
        type: ev['type'],
        source: {
          type: ev['source']['type'],
          userId: ev['source']['userId'],
        },
        replyToken: ev['replyToken'],
        message: ev['message'],
      };
      if (!(await this.isUserMessageEvent.execute(requestIsUserMessageEvent)))
        continue;
      try {
        const requestHandleEvent: HandleEventRequest = {
          ev: requestIsUserMessageEvent,
          replyTasks,
          sideTasks,
        };
        this.handleEvent.execute(requestHandleEvent);
      } catch (err) {
        this.logger.error('Failed handling event', String(err));
      }
    }

    await Promise.allSettled(replyTasks);
    await Promise.allSettled(sideTasks);
    return { status: 200, body: 'OK' };
  }
}
