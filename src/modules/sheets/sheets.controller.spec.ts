import { Test, TestingModule } from '@nestjs/testing';
import { SheetsController } from './sheets.controller';
import { SheetsService } from './sheets.service';

describe('SheetsController', () => {
  let controller: SheetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SheetsController],
      providers: [SheetsService],
    }).compile();

    controller = module.get<SheetsController>(SheetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
