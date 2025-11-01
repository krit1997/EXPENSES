import { Test, TestingModule } from '@nestjs/testing';
import { ValidateSignatureUsecaseService } from './validate-signature-usecase.service';

describe('ValidateSignatureUsecaseService', () => {
  let service: ValidateSignatureUsecaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ValidateSignatureUsecaseService],
    }).compile();

    service = module.get<ValidateSignatureUsecaseService>(ValidateSignatureUsecaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
