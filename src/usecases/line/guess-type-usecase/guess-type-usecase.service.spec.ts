import { Test, TestingModule } from '@nestjs/testing';
import { GuessTypeUsecaseService } from './guess-type-usecase.service';

describe('GuessTypeUsecaseService', () => {
  let service: GuessTypeUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuessTypeUsecaseService],
    }).compile();

    service = module.get<GuessTypeUsecaseService>(GuessTypeUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
