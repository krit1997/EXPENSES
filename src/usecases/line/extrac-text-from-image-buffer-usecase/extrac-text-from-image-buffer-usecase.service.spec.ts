import { Test, TestingModule } from '@nestjs/testing';
import { ExtracTextFromImageBufferUsecaseService } from './extrac-text-from-image-buffer-usecase.service';

describe('ExtracTextFromImageBufferUsecaseService', () => {
  let service: ExtracTextFromImageBufferUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtracTextFromImageBufferUsecaseService],
    }).compile();

    service = module.get<ExtracTextFromImageBufferUsecaseService>(ExtracTextFromImageBufferUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
