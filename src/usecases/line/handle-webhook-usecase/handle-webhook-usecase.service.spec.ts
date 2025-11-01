import { Test, TestingModule } from '@nestjs/testing';
import { HandleWebhookUsecaseService } from './handle-webhook-usecase.service';

describe('HandleWebhookUsecaseService', () => {
  let service: HandleWebhookUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HandleWebhookUsecaseService],
    }).compile();

    service = module.get<HandleWebhookUsecaseService>(HandleWebhookUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
