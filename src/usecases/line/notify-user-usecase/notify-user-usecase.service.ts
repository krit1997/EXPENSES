import { Injectable } from '@nestjs/common';
import { LineRepository } from '../../../repositories/line-repository/line-repository.service';
import { BuildConfirmMessageUsecaseService } from '../build-confirm-message-usecase/build-confirm-message-usecase.service';
import { Parsed } from '../types';

@Injectable()
export class NotifyUserUsecaseService {
  constructor(
    private readonly buildConfirmMessageUsecaseService: BuildConfirmMessageUsecaseService,
    private readonly lineRepo: LineRepository,
  ) {}
  async execute(userId: string, parsed: Parsed) {
    const msg = await this.buildConfirmMessageUsecaseService.execute(parsed);
    return this.lineRepo.pushMessage(userId, [{ type: 'text', text: msg }]);
  }
}
