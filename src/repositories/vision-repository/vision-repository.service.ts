import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';

@Injectable()
export class VisionRepository {
  private readonly client: ImageAnnotatorClient;

  constructor() {
    const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'gcp-sa.json';
    const raw = JSON.parse(fs.readFileSync(keyFile, 'utf8')) as unknown;
    const sa = raw as {
      client_email?: string;
      private_key?: string;
      project_id?: string;
    };
    const { client_email, private_key, project_id } = sa;
    if (!client_email || !private_key || !project_id) {
      throw new Error('Invalid service account key file');
    }
    this.client = new ImageAnnotatorClient({
      credentials: { client_email, private_key },
      projectId: project_id,
    });
  }

  async documentTextDetection(buffer: Buffer) {
    return this.client.documentTextDetection(buffer);
  }
}
