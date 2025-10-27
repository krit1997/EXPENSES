import { Injectable } from '@nestjs/common';
import { VisionRepository } from '../../repositories/vision-repository/vision-repository.service';

@Injectable()
export class OcrUsecase {
  constructor(private readonly vision: VisionRepository) {}

  async execute(buf: Buffer): Promise<string> {
    const raw = (await this.vision.documentTextDetection(buf)) as unknown;
    const arr = raw as Array<{ fullTextAnnotation?: { text?: string } }>;
    return String(arr[0]?.fullTextAnnotation?.text ?? '');
  }
}
