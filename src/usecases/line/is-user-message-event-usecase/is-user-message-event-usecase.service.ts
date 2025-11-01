import { Injectable } from '@nestjs/common';
import { IsUserMessageEventRequest } from '../types';

@Injectable()
export class IsUserMessageEventUsecaseService {
  constructor() {}

  async execute(ev: IsUserMessageEventRequest): Promise<boolean> {
    if (!ev) return false;

    if (ev.type !== 'message') return false;

    if (!ev.source) return false;

    if (ev.source.type !== 'user') return false;

    if (typeof ev.replyToken !== 'string') return false;

    return true;
  }
}
