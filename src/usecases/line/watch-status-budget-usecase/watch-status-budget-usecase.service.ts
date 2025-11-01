import { Injectable } from '@nestjs/common';
import { BudgetRequest } from '../../budget-status-usecase';
import { BudgetStatusUsecaseService } from '../../budget-status-usecase/budget-status-usecase.service';

@Injectable()
export class WatchStatusBudgetUsecaseService {
  constructor(
    private readonly budgetStatusUsecaseService: BudgetStatusUsecaseService,
  ) {}

  async execute(
    text: string,
    userId: string,
    reply: (message: string) => Promise<void>,
  ) {
    if (/^สถานะงบ(?:\s+(20\d{2}-(0[1-9]|1[0-2])))?$/i.test(text)) {
      const m = text.match(/^สถานะงบ(?:\s+(20\d{2}-(0[1-9]|1[0-2])))?$/i);
      const month = m?.[1];
      const request: BudgetRequest = {
        month,
        opts: {
          userId: userId,
          withPrev: true,
        },
      };
      const status = await this.budgetStatusUsecaseService.execute(request);
      const lines = [
        `สรุปงบเดือน ${status.month}`,
        `รายรับ: ${status.totals.income.toLocaleString()} | รายจ่าย: ${status.totals.expense.toLocaleString()} | สุทธิ: ${status.totals.net.toLocaleString()}`,
        status.total?.budget !== undefined
          ? `งบรวม: ${status.total.budget.toLocaleString()} | ใช้ไป: ${status.total.spent.toLocaleString()} (${(status.total.usedPct ?? 0).toFixed(1)}%)`
          : `งบรวม: - (ยังไม่ตั้ง)`,
        ...status.categories
          .filter((c) => c.budget !== undefined || c.spent > 0)
          .map(
            (c) =>
              `• ${c.name}: งบ ${c.budget?.toLocaleString() ?? '-'} | ใช้ ${c.spent.toLocaleString()}` +
              (c.usedPct !== undefined ? ` (${c.usedPct.toFixed(1)}%)` : '') +
              (c.alert ? (c.alert === 'OVER' ? ' ❗️เกินงบ' : ' ⚠️ใกล้งบ') : ''),
          ),
      ];
      return reply(lines.join('\n'));
    }
  }
}
