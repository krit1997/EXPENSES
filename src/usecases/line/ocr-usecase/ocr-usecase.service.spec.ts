import { Test, TestingModule } from '@nestjs/testing';
import { OcrUsecaseService } from './ocr-usecase.service';

describe('OcrUsecaseService', () => {
  let service: OcrUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OcrUsecaseService],
    }).compile();

    service = module.get<OcrUsecaseService>(OcrUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
