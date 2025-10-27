import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { LineModule } from './modules/line/line.module';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `src/config/env/dev.env`,
    }),
    LineModule,
  ],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.use('/webhook/line', express.raw({ type: '*/*' }));
  app.use(express.json({ limit: '2mb' }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
