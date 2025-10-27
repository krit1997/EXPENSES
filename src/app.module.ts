import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LineModule } from './modules/line/line.module';
import { SheetsController } from './modules/sheets/sheets.controller';
import { SheetsModule } from './modules/sheets/sheets.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { UsecasesModule } from './usecases/usecases.module';

@Module({
  imports: [SheetsModule, LineModule],
  controllers: [AppController, SheetsController],
  providers: [AppService, UsecasesModule, RepositoriesModule],
})
export class AppModule {}
