import { Injectable } from '@nestjs/common';
import { SheetsRepository } from '../../repositories/sheets-repository/sheets-repository.service';

@Injectable()
export class SaveSlipUsecase {
  constructor(private readonly sheets: SheetsRepository) {}

  async execute(payload: (string | number | null)[]) {
    return this.sheets.appendRow(payload);
  }
}
