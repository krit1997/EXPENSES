import { Injectable } from '@nestjs/common';
import { ParseSlipUsecase } from './parse-slip.usecase';

@Injectable()
export class ParseWhenUsecase {
  constructor(private readonly parseSlipUsecase: ParseSlipUsecase) {}

  execute(text: string): Date | undefined {
    const parsed = this.parseSlipUsecase.parseSlipText(text);
    return parsed.when;
  }
}
