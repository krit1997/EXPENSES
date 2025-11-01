import { Test, TestingModule } from '@nestjs/testing';
import { GuessCategoryUsecaseService } from './guess-category-usecase.service';

describe('GuessCategoryUsecaseService', () => {
  let service: GuessCategoryUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuessCategoryUsecaseService],
    }).compile();

    service = module.get<GuessCategoryUsecaseService>(GuessCategoryUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
