import { Injectable } from '@nestjs/common';
import { ParseSlipTextUsecaseService } from '../parse-slip-text-usecase/parse-slip-text-usecase.service';
import { Parsed } from '../types';

@Injectable()
export class ParseTextUsecaseService {
  constructor(
    private readonly parseSlipTextUsecaseService: ParseSlipTextUsecaseService,
  ) {}

  async execute(text: string): Promise<Parsed> {
    const result = await this.parseSlipTextUsecaseService.execute(text);
    return {
      item: result.item ?? undefined,
      amount: result.amount ?? undefined,
      when: result.when ?? undefined,
      merchant: result.merchant ?? undefined,
      type: result.type ?? 'unknown',
      category: result.category ?? undefined,
      subcategory: result.subcategory ?? undefined,
    };
  }
}
