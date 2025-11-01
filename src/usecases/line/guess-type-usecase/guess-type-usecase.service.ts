import { Injectable } from '@nestjs/common';
import { TypeKind } from '../../../constants/classify.rule';
import { ParseSlipTextUsecaseService } from '../parse-slip-text-usecase/parse-slip-text-usecase.service';

@Injectable()
export class GuessTypeUsecaseService {
  constructor(
    private readonly parseSlipTextUsecaseService: ParseSlipTextUsecaseService,
  ) {}

  async execute(text: string, amount: number | null): Promise<TypeKind> {
    try {
      const parsed = await this.parseSlipTextUsecaseService.execute(text);
      return (parsed.type ?? 'unknown') as TypeKind;
    } catch {
      const t = String(text).toLowerCase();
      if (/[+]\d/.test(t) || /เงินเดือน|โบนัส|income|รายรับ/.test(t))
        return 'income';
      if (amount != null) return 'expense';
      return 'unknown';
    }
  }
}
