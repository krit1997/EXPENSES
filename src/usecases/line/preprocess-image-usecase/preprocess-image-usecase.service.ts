import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class PreprocessImageUsecaseService {
  async execute(buf: Buffer): Promise<Buffer> {
    return sharp(buf)
      .grayscale()
      .resize({ width: 1800, withoutEnlargement: true })
      .sharpen()
      .toBuffer();
  }
}
