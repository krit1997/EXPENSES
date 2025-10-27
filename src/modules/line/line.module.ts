import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../../repositories/repositories.module';
import { UsecasesModule } from '../../usecases/usecases.module';
import { SheetsModule } from '../sheets/sheets.module';
import { LineController } from './line.controller';
import { LineService } from './line.service';

@Module({
  imports: [SheetsModule, RepositoriesModule, UsecasesModule],
  controllers: [LineController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}
