import { Test, TestingModule } from '@nestjs/testing';
import { TransactionRepositoryService } from './transaction-repository.service';

describe('TransactionRepositoryService', () => {
  let service: TransactionRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionRepositoryService],
    }).compile();

    service = module.get<TransactionRepositoryService>(TransactionRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
