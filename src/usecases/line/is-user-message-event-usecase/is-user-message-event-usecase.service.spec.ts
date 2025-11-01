import { Test, TestingModule } from '@nestjs/testing';
import { IsUserMessageEventUsecaseService } from './is-user-message-event-usecase.service';

describe('IsUserMessageEventUsecaseService', () => {
  let service: IsUserMessageEventUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IsUserMessageEventUsecaseService],
    }).compile();

    service = module.get<IsUserMessageEventUsecaseService>(IsUserMessageEventUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
