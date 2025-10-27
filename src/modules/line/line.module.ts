import { Module } from '@nestjs/common';
import { SheetsModule } from '../sheets/sheets.module';
import { LineController } from './line.controller';
import { LineService } from './line.service';

@Module({
  imports: [SheetsModule],
  controllers: [LineController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}
