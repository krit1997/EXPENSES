import { Module } from '@nestjs/common';
import { RepositoriesModule } from '../repositories/repositories.module';
import { BudgetStatusUsecaseService } from './budget-status-usecase/budget-status-usecase.service';
import { GuessCategoryUsecase } from './line/guess-category.usecase';
import { GuessTypeUsecase } from './line/guess-type.usecase';
import { HandleSlipUsecase } from './line/handle-slip.usecase';
import { HandleWebhookUsecase } from './line/handle-webhook.usecase';
import { NotifyUserUsecase } from './line/notify-user.usecase';
import { OcrUsecase } from './line/ocr.usecase';
import { ParseSlipUsecase } from './line/parse-slip.usecase';
import { ParseTextUsecase } from './line/parse-text.usecase';
import { ParseWhenUsecase } from './line/parse-when.usecase';
import { PreprocessImageUsecase } from './line/preprocess-image.usecase';
import { SaveSlipUsecase } from './line/save-slip.usecase';
import { WatchStatusBudgetUsecaseService } from './line/watch-status-budget-usecase/watch-status-budget-usecase.service';

@Module({
  imports: [RepositoriesModule],
  providers: [
    HandleSlipUsecase,
    PreprocessImageUsecase,
    OcrUsecase,
    ParseSlipUsecase,
    SaveSlipUsecase,
    NotifyUserUsecase,
    ParseTextUsecase,
    ParseWhenUsecase,
    GuessTypeUsecase,
    GuessCategoryUsecase,
    HandleWebhookUsecase,
    BudgetStatusUsecaseService,
    WatchStatusBudgetUsecaseService,
  ],
  exports: [
    HandleSlipUsecase,
    PreprocessImageUsecase,
    OcrUsecase,
    ParseSlipUsecase,
    SaveSlipUsecase,
    NotifyUserUsecase,
    ParseTextUsecase,
    ParseWhenUsecase,
    GuessTypeUsecase,
    GuessCategoryUsecase,
    HandleWebhookUsecase,
    BudgetStatusUsecaseService,
    WatchStatusBudgetUsecaseService,
  ],
})
export class UsecasesModule {}
