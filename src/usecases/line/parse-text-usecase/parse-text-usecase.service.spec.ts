import { Test, TestingModule } from '@nestjs/testing';
import { ParseTextUsecaseService } from './parse-text-usecase.service';

describe('ParseTextUsecaseService', () => {
  let service: ParseTextUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParseTextUsecaseService],
    }).compile();

    service = module.get<ParseTextUsecaseService>(ParseTextUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
