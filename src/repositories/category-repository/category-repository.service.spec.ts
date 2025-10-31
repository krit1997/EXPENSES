import { Test, TestingModule } from '@nestjs/testing';
import { CatacoryRepositoryService } from './category-repository.service';

describe('CatacoryRepositoryService', () => {
  let service: CatacoryRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatacoryRepositoryService],
    }).compile();

    service = module.get<CatacoryRepositoryService>(CatacoryRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
