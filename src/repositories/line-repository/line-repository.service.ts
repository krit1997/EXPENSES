import { Client, type Message } from '@line/bot-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';

@Injectable()
export class LineRepository {
  private readonly client: Client;
  private readonly logger = new Logger(LineRepository.name);

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>('LINE_CHANNEL_ACCESS_TOKEN');
    if (!token) {
      this.logger.error('Missing LINE_CHANNEL_ACCESS_TOKEN');
      throw new Error('Missing LINE_CHANNEL_ACCESS_TOKEN');
    }
    this.client = new Client({ channelAccessToken: token });
  }

  async getMessageContent(messageId: string): Promise<Readable> {
    try {
      return await this.client.getMessageContent(messageId);
    } catch (err) {
      this.logger.error('[LINE getMessageContent] ' + String(err));
      throw err;
    }
  }

  async pushMessage(to: string, msgs: Message | Message[]) {
    try {
      return await this.client.pushMessage(to, msgs);
    } catch (err) {
      this.logger.error('[LINE pushMessage] ' + String(err));
      throw err;
    }
  }

  async replyMessage(replyToken: string, msgs: Message | Message[]) {
    try {
      return await this.client.replyMessage(replyToken, msgs);
    } catch (err) {
      this.logger.error('[LINE replyMessage] ' + String(err));
      throw err;
    }
  }

  async getProfile(userId: string) {
    try {
      return await this.client.getProfile(userId);
    } catch (err) {
      this.logger.error('[LINE getProfile] ' + String(err));
      throw err;
    }
  }
}
