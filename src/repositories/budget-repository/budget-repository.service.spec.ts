import { Test, TestingModule } from '@nestjs/testing';
import { BudgetRepositoryService } from './budget-repository.service';

describe('BudgetRepositoryService', () => {
  let service: BudgetRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetRepositoryService],
    }).compile();

    service = module.get<BudgetRepositoryService>(BudgetRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
