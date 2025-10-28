import { ImageAnnotatorClient } from '@google-cloud/vision';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VisionRepository {
  private readonly client: ImageAnnotatorClient;

  constructor() {
    const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (keyFile) {
      this.client = new ImageAnnotatorClient({ keyFilename: keyFile });
    } else {
      // fallback to ADC / environment
      this.client = new ImageAnnotatorClient();
    }
  }

  async documentTextDetection(buffer: Buffer) {
    return this.client.documentTextDetection(buffer);
  }
}
