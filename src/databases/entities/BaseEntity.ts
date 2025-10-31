import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ nullable: true })
  created_by?: string;

  @Column({ nullable: true })
  updated_by?: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_date?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_date?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_date?: Date;
}
