import { Test, TestingModule } from '@nestjs/testing';
import { ParseSlipTextUsecaseService } from './parse-slip-text-usecase.service';

describe('ParseSlipTextUsecaseService', () => {
  let service: ParseSlipTextUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParseSlipTextUsecaseService],
    }).compile();

    service = module.get<ParseSlipTextUsecaseService>(ParseSlipTextUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
