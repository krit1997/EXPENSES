import { Test, TestingModule } from '@nestjs/testing';
import { ReadImageBufferUsecaseService } from './read-image-buffer-usecase.service';

describe('ReadImageBufferUsecaseService', () => {
  let service: ReadImageBufferUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadImageBufferUsecaseService],
    }).compile();

    service = module.get<ReadImageBufferUsecaseService>(ReadImageBufferUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
