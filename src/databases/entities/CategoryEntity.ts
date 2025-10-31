import { Column, Entity, OneToMany } from 'typeorm';
import { ExpenseType } from '../../constants/TypeExpenses';
import { BaseEntity } from './BaseEntity';
import { BudgetEntity } from './BudgetEntity';
import { TransactionEntity } from './TransactionEntity';

@Entity({ name: 'category' })
export class CategoryEntity extends BaseEntity {
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  type: ExpenseType;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  keywords: string[];

  @OneToMany(() => BudgetEntity, (budget) => budget.category, {
    nullable: true,
  })
  budgets: BudgetEntity[];

  @OneToMany(() => TransactionEntity, (transaction) => transaction.category, {
    nullable: true,
  })
  transactions: TransactionEntity[];
}
