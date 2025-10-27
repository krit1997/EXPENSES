import { Injectable } from '@nestjs/common';
import type { TypeKind } from '../../constants/classify.rule';
import { ParseSlipUsecase } from './parse-slip.usecase';

@Injectable()
export class GuessTypeUsecase {
  constructor(private readonly parseSlipUsecase: ParseSlipUsecase) {}

  execute(text: string, amount: number | null): TypeKind {
    try {
      const parsed = this.parseSlipUsecase.parseSlipText(text);
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
