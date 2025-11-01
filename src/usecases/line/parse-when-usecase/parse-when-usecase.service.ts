import { Injectable } from '@nestjs/common';
import { ParseSlipTextUsecaseService } from '../parse-slip-text-usecase/parse-slip-text-usecase.service';

@Injectable()
export class ParseWhenUsecaseService {
  constructor(private readonly parseSlipUsecase: ParseSlipTextUsecaseService) {}

  async execute(text: string): Promise<Date | undefined> {
    const parsed = await this.parseSlipUsecase.execute(text);
    return parsed.when;
  }
}
