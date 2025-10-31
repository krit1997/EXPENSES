import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { CategoryEntity } from './CategoryEntity';

@Entity('transactions')
@Index(['month'])
export class TransactionEntity extends BaseEntity {
  @Column()
  user_id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: string;

  @Column({ type: 'text' })
  month: string;

  @ManyToOne(() => CategoryEntity, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: CategoryEntity | null;
}
