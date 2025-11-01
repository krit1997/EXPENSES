import { Test, TestingModule } from '@nestjs/testing';
import { HandleEventUsecasesService } from './handle-event-usecases.service';

describe('HandleEventUsecasesService', () => {
  let service: HandleEventUsecasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleEventUsecasesService],
    }).compile();

    service = module.get<HandleEventUsecasesService>(HandleEventUsecasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
