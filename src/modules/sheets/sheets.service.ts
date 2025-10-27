import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { google } from 'googleapis';

@Injectable()
export class SheetsService {
  private readonly sheets = google.sheets('v4');
  private readonly auth;

  constructor() {
    const credentials = JSON.parse(fs.readFileSync('gcp-sa.json', 'utf8'));
    this.auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  async appendRow(values: (string | number | null)[]) {
    const client = await this.auth.getClient();
    await this.sheets.spreadsheets.values.append({
      auth: client,
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    });
  }
}
