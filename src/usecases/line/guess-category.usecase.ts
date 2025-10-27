import { Injectable } from '@nestjs/common';
import { ParseSlipUsecase } from './parse-slip.usecase';

@Injectable()
export class GuessCategoryUsecase {
  constructor(private readonly parseSlipUsecase: ParseSlipUsecase) {}

  execute(text: string): { category?: string; subcategory?: string } {
    return this.parseSlipUsecase.guessCategory(text);
  }
}
