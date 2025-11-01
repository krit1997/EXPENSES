import { Injectable, Logger } from '@nestjs/common';
import { LineRepository } from '../../../repositories/line-repository/line-repository.service';

@Injectable()
export class ReadImageBufferUsecaseService {
  private readonly logger = new Logger(ReadImageBufferUsecaseService.name);

  constructor(private readonly lineRepo: LineRepository) {}

  async execute(messageId: string): Promise<Buffer> {
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
}
