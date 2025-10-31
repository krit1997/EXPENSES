import { Injectable, Logger } from '@nestjs/common';
import type { GoogleAuth, OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

@Injectable()
export class SheetsService {
  private readonly sheets = google.sheets('v4');
  private readonly auth: GoogleAuth;
  private readonly logger = new Logger(SheetsService.name);
  private readonly serviceAccountEmail?: string;

  constructor() {
    const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (keyFile) {
      this.auth = new google.auth.GoogleAuth({
        keyFilename: keyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      this.logger.log(`Using GOOGLE_APPLICATION_CREDENTIALS=${keyFile}`);
      // Try to extract service account email from the key file for better error messages
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const raw = require(keyFile);
        if (raw && typeof raw.client_email === 'string') {
          this.serviceAccountEmail = raw.client_email;
          this.logger.log(
            `Sheets service account: ${this.serviceAccountEmail}`,
          );
        }
      } catch (e) {
        // not fatal — we only use this for debugging/helpful logs
        this.logger.debug(
          'Unable to read service account email from key file: ' + String(e),
        );
      }
    } else {
      // Let GoogleAuth use Application Default Credentials if present in the environment
      this.logger.log(
        'GOOGLE_APPLICATION_CREDENTIALS not set; using ADC if available',
      );
      this.auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    }
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
      this.logger.debug(
        `Appending to spreadsheet=${spreadsheetId} using sa=${this.serviceAccountEmail ?? 'ADC'}`,
      );
      await this.sheets.spreadsheets.values.append({
        auth: client,
        spreadsheetId,
        range: 'A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [values] },
      });
    } catch (err) {
      this.logger.error('[Sheets] appendRow failed: ' + String(err));
      // Common cause: service account not granted access to the spreadsheet.
      if (String(err).includes('The caller does not have permission')) {
        const help = `The Sheets API returned 'The caller does not have permission'.
Ensure the spreadsheet (id=${spreadsheetId}) is shared with the service account email: ${this.serviceAccountEmail ?? '<service-account-email>'} and that the Google Sheets API is enabled for the project.`;
        this.logger.error('[Sheets] Permission help: ' + help);
      }
      throw err;
    }
  }
}
