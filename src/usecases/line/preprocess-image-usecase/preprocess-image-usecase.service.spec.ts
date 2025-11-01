import { Test, TestingModule } from '@nestjs/testing';
import { PreprocessImageUsecaseService } from './preprocess-image-usecase.service';

describe('PreprocessImageUsecaseService', () => {
  let service: PreprocessImageUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreprocessImageUsecaseService],
    }).compile();

    service = module.get<PreprocessImageUsecaseService>(PreprocessImageUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
