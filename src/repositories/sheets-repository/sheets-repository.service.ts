import { Injectable } from '@nestjs/common';
import { SheetsService } from '../../modules/sheets/sheets.service';

@Injectable()
export class SheetsRepository {
  constructor(private readonly sheets: SheetsService) {}

  async appendRow(values: (string | number | null)[]) {
    return this.sheets.appendRow(values);
  }
}
