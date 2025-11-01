import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { IsNull } from 'typeorm';
import { BudgetRequest } from '.';
import { BudgetStatus } from '../../constants/BudgetStatus.interface';
import { BudgetRepository } from '../../repositories/budget-repository/budget-repository.service';
import { CategoryRepository } from '../../repositories/category-repository/category-repository.service';
import { TransactionRepository } from '../../repositories/transaction-repository/transaction-repository.service';

dayjs.extend(utc);
dayjs.extend(tz);

@Injectable()
export class BudgetStatusUsecaseService {
  constructor(
    private bRepo: BudgetRepository,
    private cRepo: CategoryRepository,
    private tRepo: TransactionRepository,
  ) {}

  async execute(req: BudgetRequest) {
    const tz = process.env.TIMEZONE || 'Asia/Bangkok';
    const m = req.month ?? dayjs().tz(tz).format('YYYY-MM');
    const alertNear =
      req.opts?.alertNear ?? Number(process.env.ALERT_BUDGET_NEAR ?? 0.8);
    const alertOver =
      req.opts?.alertOver ?? Number(process.env.ALERT_BUDGET_OVER ?? 1);

    // ----- Budgets -----
    const [totalBudgetRow, catBudgetRows] = await Promise.all([
      this.bRepo.findOne({
        where: {
          month: m,
          scope: 'total',
          category: IsNull(),
        },
        relations: ['category'],
      }),
      this.bRepo.findAll({
        where: { month: m, scope: 'category' },
        relations: ['category'],
      }),
    ]);

    // ----- Spent by category (expense only) -----
    const spentRows = await this.tRepo
      .createQueryBuilder('t')
      .leftJoin('t.category', 'c')
      .select("COALESCE(c.name,'Uncategorized')", 'name')
      .addSelect('SUM(t.amount)::numeric', 'spent')
      .where('t.month = :m', { m })
      .andWhere("(c.type IS NULL OR c.type='expense')")
      .andWhere(
        req.opts?.userId ? 't.user_id = :u' : '1=1',
        req.opts?.userId ? { u: req.opts.userId } : {},
      )
      .groupBy('name')
      .getRawMany<{ name: string; spent: string }>();

    const spentByName = new Map(
      spentRows.map((r) => [r.name, Number(r.spent)]),
    );

    // ----- Income / Expense / Net (for month) -----
    const [incomeRow, expenseRow] = await Promise.all([
      this.tRepo
        .createQueryBuilder('t')
        .leftJoin('t.category', 'c')
        .select('SUM(t.amount)::numeric', 'amt')
        .where('t.month = :m', { m })
        .andWhere("c.type='income'")
        .andWhere(
          req.opts?.userId ? 't.user_id = :u' : '1=1',
          req.opts?.userId ? { u: req.opts.userId } : {},
        )
        .getRawOne<{ amt: string }>(),
      this.tRepo
        .createQueryBuilder('t')
        .leftJoin('t.category', 'c')
        .select('SUM(t.amount)::numeric', 'amt')
        .where('t.month = :m', { m })
        .andWhere("(c.type IS NULL OR c.type='expense')")
        .andWhere(
          req.opts?.userId ? 't.user_id = :u' : '1=1',
          req.opts?.userId ? { u: req.opts.userId } : {},
        )
        .getRawOne<{ amt: string }>(),
    ]);
    const income = Number(incomeRow?.amt || 0);
    const expense = Number(expenseRow?.amt || 0);
    const net = income - expense;

    // ----- Build per-category status -----
    const cats = await this.cRepo.findAll({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    const categories = cats.map((c) => {
      const spent = spentByName.get(c.name) ?? 0;
      const b = catBudgetRows.find((b) => b.category?.id === c.id);
      const budget = b ? Number(b.amount) : undefined;
      const remaining = budget !== undefined ? budget - spent : undefined;
      const usedPct = this.pct(spent, budget);
      let alert: 'OVER' | 'NEAR' | undefined;

      if (usedPct === undefined) {
        alert = undefined;
      } else if (usedPct >= alertOver * 100) {
        alert = 'OVER';
      } else if (usedPct >= alertNear * 100) {
        alert = 'NEAR';
      }
      return { name: c.name, budget, spent, remaining, usedPct, alert };
    });

    // ----- Total budget status -----
    const totalBudget = totalBudgetRow
      ? Number(totalBudgetRow.amount)
      : undefined;
    const totalRemaining =
      totalBudget !== undefined ? totalBudget - expense : undefined;
    const totalUsedPct = this.pct(expense, totalBudget);
    let totalAlert: 'OVER' | 'NEAR' | undefined;
    if (totalUsedPct === undefined) {
      totalAlert = undefined;
    } else if (totalUsedPct >= alertOver * 100) {
      totalAlert = 'OVER';
    } else if (totalUsedPct >= alertNear * 100) {
      totalAlert = 'NEAR';
    } else {
      totalAlert = undefined;
    }

    // ----- Prev month compare (optional) -----
    let prevCompare: BudgetStatus['prevCompare'] = undefined;
    if (req.opts?.withPrev) {
      const prev = dayjs(m + '-01')
        .subtract(1, 'month')
        .format('YYYY-MM');
      const [prevIncomeRow, prevExpenseRow] = await Promise.all([
        this.tRepo
          .createQueryBuilder('t')
          .leftJoin('t.category', 'c')
          .select('SUM(t.amount)::numeric', 'amt')
          .where('t.month = :p', { p: prev })
          .andWhere("c.type='income'")
          .andWhere(
            req.opts?.userId ? 't.user_id = :u' : '1=1',
            req.opts?.userId ? { u: req.opts.userId } : {},
          )
          .getRawOne<{ amt: string }>(),
        this.tRepo
          .createQueryBuilder('t')
          .leftJoin('t.category', 'c')
          .select('SUM(t.amount)::numeric', 'amt')
          .where('t.month = :p', { p: prev })
          .andWhere("(c.type IS NULL OR c.type='expense')")
          .andWhere(
            req.opts?.userId ? 't.user_id = :u' : '1=1',
            req.opts?.userId ? { u: req.opts.userId } : {},
          )
          .getRawOne<{ amt: string }>(),
      ]);
      const pi = Number(prevIncomeRow?.amt || 0);
      const pe = Number(prevExpenseRow?.amt || 0);
      const pn = pi - pe;
      const ch = (curr: number, prev: number) =>
        prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;
      prevCompare = {
        incomeChangePct: ch(income, pi),
        expenseChangePct: ch(expense, pe),
        netChangePct: ch(net, pn),
      };
    }

    return {
      month: m,
      total: {
        budget: totalBudget,
        spent: expense,
        remaining: totalRemaining,
        usedPct: totalUsedPct,
        alert: totalAlert,
      },
      categories,
      totals: { income, expense, net },
      prevCompare,
    };
  }

  private pct(x: number, y?: number) {
    if (!y || y === 0) return undefined;
    return (x / y) * 100;
  }
}
