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

  @Column({ nullable: true, name: 'created_by' })
  createdBy?: string;

  @Column({ nullable: true, name: 'updated_by' })
  updatedBy?: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_date' })
  createdDate?: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_date' })
  updatedDate?: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_date' })
  deletedDate?: Date;

  @Column({ nullable: true, name: 'is_active' })
  isActive?: boolean;
}
