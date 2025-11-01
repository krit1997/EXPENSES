import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabasesModule } from '../databases/databases.module';
import { BudgetEntity } from '../databases/entities/BudgetEntity';
import { CategoryEntity } from '../databases/entities/CategoryEntity';
import { TransactionEntity } from '../databases/entities/TransactionEntity';
import { SheetsModule } from '../modules/sheets/sheets.module';
import { BudgetRepository } from './budget-repository/budget-repository.service';
import { CategoryRepository } from './category-repository/category-repository.service';
import { LineRepository } from './line-repository/line-repository.service';
import { SheetsRepository } from './sheets-repository/sheets-repository.service';
import { TransactionRepository } from './transaction-repository/transaction-repository.service';
import { VisionRepository } from './vision-repository/vision-repository.service';

@Module({
  imports: [
    ConfigModule,
    SheetsModule,
    DatabasesModule,
    TypeOrmModule.forFeature([CategoryEntity, BudgetEntity, TransactionEntity]),
  ],
  providers: [
    LineRepository,
    VisionRepository,
    SheetsRepository,
    CategoryRepository,
    BudgetRepository,
    TransactionRepository,
  ],
  exports: [
    LineRepository,
    VisionRepository,
    SheetsRepository,
    CategoryRepository,
    BudgetRepository,
    TransactionRepository,
  ],
})
export class RepositoriesModule {}
