import { Injectable, Logger } from '@nestjs/common';
import type { GoogleAuth, JWTInput, OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as fs from 'node:fs';

@Injectable()
export class SheetsService {
  private readonly sheets = google.sheets('v4');
  private readonly auth: GoogleAuth;
  private readonly logger = new Logger(SheetsService.name);

  constructor() {
    let credentials: unknown = undefined;
    try {
      const raw = fs.readFileSync('gcp-sa.json', 'utf8');
      credentials = JSON.parse(raw) as unknown;
    } catch (err) {
      this.logger.error('Failed to read or parse gcp-sa.json: ' + String(err));
      throw err;
    }

    this.auth = new google.auth.GoogleAuth({
      // google-auth accepts a credentials object; cast to JWTInput which matches service account JSON
      credentials: credentials as JWTInput,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  async appendRow(values: (string | number | null)[]): Promise<void> {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      this.logger.error('Missing GOOGLE_SHEETS_SPREADSHEET_ID env var');
      throw new Error('Missing GOOGLE_SHEETS_SPREADSHEET_ID');
    }

    let client: OAuth2Client;
    try {
      client = (await this.auth.getClient()) as unknown as OAuth2Client;
    } catch (err) {
      this.logger.error('[Sheets] getClient failed: ' + String(err));
      throw err;
    }

    try {
      await this.sheets.spreadsheets.values.append({
        auth: client,
        spreadsheetId,
        range: 'A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [values] },
      });
    } catch (err) {
      this.logger.error('[Sheets] appendRow failed: ' + String(err));
      throw err;
    }
  }
}
