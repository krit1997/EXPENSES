import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SheetsModule } from '../modules/sheets/sheets.module';
import { LineRepository } from './line-repository/line-repository.service';
import { SheetsRepository } from './sheets-repository/sheets-repository.service';
import { VisionRepository } from './vision-repository/vision-repository.service';

@Module({
  imports: [ConfigModule, SheetsModule],
  providers: [LineRepository, VisionRepository, SheetsRepository],
  exports: [LineRepository, VisionRepository, SheetsRepository],
})
export class RepositoriesModule {}
