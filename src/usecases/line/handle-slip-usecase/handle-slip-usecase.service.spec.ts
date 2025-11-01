import { Test, TestingModule } from '@nestjs/testing';
import { HandleSlipUsecaseService } from './handle-slip-usecase.service';

describe('HandleSlipUsecaseService', () => {
  let service: HandleSlipUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleSlipUsecaseService],
    }).compile();

    service = module.get<HandleSlipUsecaseService>(HandleSlipUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
