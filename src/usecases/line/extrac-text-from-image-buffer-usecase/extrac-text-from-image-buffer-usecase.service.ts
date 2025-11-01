import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { VisionRepository } from '../../../repositories/vision-repository/vision-repository.service';

@Injectable()
export class ExtracTextFromImageBufferUsecaseService {
  constructor(private readonly visionRepo: VisionRepository) {} // VisionRepository

  async execute(imgBuf: Buffer): Promise<string> {
    const preprocessed = await sharp(imgBuf)
      .grayscale()
      .resize({ width: 1800, withoutEnlargement: true })
      .sharpen()
      .toBuffer();

    const visionRes = await this.visionRepo.documentTextDetection(preprocessed);
    let rawText = '';
    if (Array.isArray(visionRes) && visionRes.length > 0) {
      const res0 = visionRes[0];
      if (res0 && typeof res0 === 'object') {
        const f = (res0 as { fullTextAnnotation?: unknown }).fullTextAnnotation;
        if (f && typeof f === 'object') {
          const text = (f as { text?: unknown }).text;
          if (typeof text === 'string') rawText = text;
        }
      }
    }
    return rawText;
  }
}
