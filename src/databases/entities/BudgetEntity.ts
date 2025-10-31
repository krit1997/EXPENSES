import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { CategoryEntity } from './CategoryEntity';

@Entity('budgets')
@Index(['month'])
@Index(['month', 'scope', 'category'], { unique: true })
export class BudgetEntity extends BaseEntity {
  @Column({ type: 'text' })
  month: string;

  @Column({ type: 'text' })
  scope: 'category' | 'total';

  @ManyToOne(() => CategoryEntity, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity | null;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: string;
}
