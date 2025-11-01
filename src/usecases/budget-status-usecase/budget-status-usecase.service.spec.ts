import { Test, TestingModule } from '@nestjs/testing';
import { BudgetStatusUsecaseService } from './budget-status-usecase.service';

describe('BudgetStatusUsecaseService', () => {
  let service: BudgetStatusUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetStatusUsecaseService],
    }).compile();

    service = module.get<BudgetStatusUsecaseService>(BudgetStatusUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
