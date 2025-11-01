// src/modules/line/line.service.ts
import { Injectable } from '@nestjs/common';
import { HandleWebhookUsecaseService } from '../../usecases/line/handle-webhook-usecase/handle-webhook-usecase.service';

@Injectable()
export class LineService {
  constructor(
    private readonly handleWebhookUsecaseService: HandleWebhookUsecaseService,
  ) {}

  async handleWebhook(bodyBuf: unknown, signature?: string) {
    // Delegate to the dedicated usecase which encapsulates the webhook loop.
    return this.handleWebhookUsecaseService.execute(bodyBuf, signature);
  }
}
