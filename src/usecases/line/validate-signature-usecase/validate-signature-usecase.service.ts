import { validateSignature } from '@line/bot-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { ValidateSignatureRequest } from '../types';

@Injectable()
export class ValidateSignatureUsecaseService {
  private readonly logger = new Logger(ValidateSignatureUsecaseService.name);
  constructor() {}

  async execute(request: ValidateSignatureRequest): Promise<boolean> {
    const { bodyText, secret, signature } = request;
    try {
      return validateSignature(bodyText, secret, signature);
    } catch (err) {
      this.logger.warn('Signature validation failed: ' + String(err));
      return false;
    }
  }
}
