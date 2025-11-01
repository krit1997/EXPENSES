import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../repositories/repositories.module';
import { BudgetStatusUsecaseService } from './budget-status-usecase/budget-status-usecase.service';
import { BuildConfirmMessageUsecaseService } from './line/build-confirm-message-usecase/build-confirm-message-usecase.service';
import { ExtracTextFromImageBufferUsecaseService } from './line/extrac-text-from-image-buffer-usecase/extrac-text-from-image-buffer-usecase.service';
import { GuessCategoryUsecaseService } from './line/guess-category-usecase/guess-category-usecase.service';
import { GuessTypeUsecaseService } from './line/guess-type-usecase/guess-type-usecase.service';
import { HandleEventUsecasesService } from './line/handle-event-usecases/handle-event-usecases.service';
import { HandleSlipUsecaseService } from './line/handle-slip-usecase/handle-slip-usecase.service';
import { HandleWebhookUsecaseService } from './line/handle-webhook-usecase/handle-webhook-usecase.service';
import { IsUserMessageEventUsecaseService } from './line/is-user-message-event-usecase/is-user-message-event-usecase.service';
import { NotifyUserUsecaseService } from './line/notify-user-usecase/notify-user-usecase.service';
import { ParseEventsSafeUsecaseService } from './line/parse-events-safe-usecase/parse-events-safe-usecase.service';
import { ParseSlipTextUsecaseService } from './line/parse-slip-text-usecase/parse-slip-text-usecase.service';
import { ReadImageBufferUsecaseService } from './line/read-image-buffer-usecase/read-image-buffer-usecase.service';
import { ValidateSignatureUsecaseService } from './line/validate-signature-usecase/validate-signature-usecase.service';
import { WatchStatusBudgetUsecaseService } from './line/watch-status-budget-usecase/watch-status-budget-usecase.service';
import { OcrUsecaseService } from './line/ocr-usecase/ocr-usecase.service';
import { ParseTextUsecaseService } from './line/parse-text-usecase/parse-text-usecase.service';
import { ParseWhenUsecaseService } from './line/parse-when-usecase/parse-when-usecase.service';
import { PreprocessImageUsecaseService } from './line/preprocess-image-usecase/preprocess-image-usecase.service';

@Module({
  imports: [RepositoriesModule],
  providers: [
    BudgetStatusUsecaseService,
    WatchStatusBudgetUsecaseService,
    ValidateSignatureUsecaseService,
    ParseEventsSafeUsecaseService,
    IsUserMessageEventUsecaseService,
    HandleEventUsecasesService,
    HandleWebhookUsecaseService,
    GuessCategoryUsecaseService,
    BuildConfirmMessageUsecaseService,
    ParseSlipTextUsecaseService,
    NotifyUserUsecaseService,
    GuessTypeUsecaseService,
    HandleSlipUsecaseService,
    ReadImageBufferUsecaseService,
    ExtracTextFromImageBufferUsecaseService,
    OcrUsecaseService,
    ParseTextUsecaseService,
    ParseWhenUsecaseService,
    PreprocessImageUsecaseService,
  ],
  exports: [
    BudgetStatusUsecaseService,
    WatchStatusBudgetUsecaseService,
    ValidateSignatureUsecaseService,
    ParseEventsSafeUsecaseService,
    IsUserMessageEventUsecaseService,
    HandleEventUsecasesService,
    HandleWebhookUsecaseService,
    GuessCategoryUsecaseService,
    BuildConfirmMessageUsecaseService,
    ParseSlipTextUsecaseService,
    NotifyUserUsecaseService,
    GuessTypeUsecaseService,
    HandleSlipUsecaseService,
    ReadImageBufferUsecaseService,
    ExtracTextFromImageBufferUsecaseService,
  ],
})
export class UsecasesModule {}
