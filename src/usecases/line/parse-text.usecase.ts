import { Injectable } from '@nestjs/common';
import { ParseSlipUsecase } from './parse-slip.usecase';

@Injectable()
export class ParseTextUsecase {
  constructor(private readonly parseSlipUsecase: ParseSlipUsecase) {}

  execute(text: string) {
    return this.parseSlipUsecase.parseSlipText(text);
  }
}
