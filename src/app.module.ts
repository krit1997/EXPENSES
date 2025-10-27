import { Module } from '@nestjs/common';
import { LineController } from './modules/line/line.controller';
import { LineModule } from './modules/line/line.module';
import { SheetsController } from './modules/sheets/sheets.controller';
import { SheetsModule } from './modules/sheets/sheets.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { UsecasesModule } from './usecases/usecases.module';

@Module({
  imports: [SheetsModule, LineModule],
  controllers: [SheetsController, LineController],
  providers: [UsecasesModule, RepositoriesModule, LineModule],
})
export class AppModule {}
