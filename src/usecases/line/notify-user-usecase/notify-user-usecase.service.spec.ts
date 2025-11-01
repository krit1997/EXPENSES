import { Test, TestingModule } from '@nestjs/testing';
import { NotifyUserUsecaseService } from './notify-user-usecase.service';

describe('NotifyUserUsecaseService', () => {
  let service: NotifyUserUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotifyUserUsecaseService],
    }).compile();

    service = module.get<NotifyUserUsecaseService>(NotifyUserUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
