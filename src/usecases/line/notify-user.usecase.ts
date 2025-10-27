import { Injectable } from '@nestjs/common';
import { LineRepository } from '../../repositories/line-repository/line-repository.service';
import { ParseSlipUsecase, Parsed } from './parse-slip.usecase';

@Injectable()
export class NotifyUserUsecase {
  constructor(
    private readonly lineRepo: LineRepository,
    private readonly parser: ParseSlipUsecase,
  ) {}

  async execute(userId: string, parsed: Parsed) {
    const msg = this.parser.buildConfirmMessage(parsed);
    return this.lineRepo.pushMessage(userId, [{ type: 'text', text: msg }]);
  }
}
