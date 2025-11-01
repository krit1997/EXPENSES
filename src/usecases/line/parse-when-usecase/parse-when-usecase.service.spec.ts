import { Test, TestingModule } from '@nestjs/testing';
import { ParseWhenUsecaseService } from './parse-when-usecase.service';

describe('ParseWhenUsecaseService', () => {
  let service: ParseWhenUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParseWhenUsecaseService],
    }).compile();

    service = module.get<ParseWhenUsecaseService>(ParseWhenUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
