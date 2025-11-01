import { Test, TestingModule } from '@nestjs/testing';
import { BuildConfirmMessageUsecaseService } from './build-confirm-message-usecase.service';

describe('BuildConfirmMessageUsecaseService', () => {
  let service: BuildConfirmMessageUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildConfirmMessageUsecaseService],
    }).compile();

    service = module.get<BuildConfirmMessageUsecaseService>(BuildConfirmMessageUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
