import { Injectable, Logger } from '@nestjs/common';
import { HandleEventRequest } from '../types';

@Injectable()
export class ParseEventsSafeUsecaseService {
  private readonly logger = new Logger(ParseEventsSafeUsecaseService.name);
  constructor() {}

  async execute(bodyText: string): Promise<HandleEventRequest[]> {
    try {
      const body = JSON.parse(bodyText) as HandleEventRequest;
      if (body) {
        const rec = body;
        if (Array.isArray(rec['events']))
          return rec['events'] as HandleEventRequest[];
      }
      return [];
    } catch (err) {
      this.logger.warn('Invalid JSON in webhook body: ' + String(err));
      return [];
    }
  }
}
