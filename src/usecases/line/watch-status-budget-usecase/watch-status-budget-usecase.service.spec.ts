import { Test, TestingModule } from '@nestjs/testing';
import { WatchStatusBudgetUsecaseService } from './watch-status-budget-usecase.service';

describe('WatchStatusBudgetUsecaseService', () => {
  let service: WatchStatusBudgetUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WatchStatusBudgetUsecaseService],
    }).compile();

    service = module.get<WatchStatusBudgetUsecaseService>(WatchStatusBudgetUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
