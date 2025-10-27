// src/modules/line/line.service.ts
import { Injectable } from '@nestjs/common';
import { HandleWebhookUsecase } from '../../usecases/line/handle-webhook.usecase';

@Injectable()
export class LineService {
  constructor(private readonly handleWebhookUsecase: HandleWebhookUsecase) {}

  async handleWebhook(
    bodyBuf: unknown,
    signature?: string,
  ): Promise<{ status: number; body: string }> {
    // Delegate to the dedicated usecase which encapsulates the webhook loop.
    return this.handleWebhookUsecase.execute(bodyBuf, signature);
  }
}
