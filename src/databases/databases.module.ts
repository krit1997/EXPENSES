import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('POSTGRES_HOST');
        const portRaw = configService.get<string | number | undefined>(
          'POSTGRES_PORT',
        );
        const password = configService.get<string>('POSTGRES_PASSWORD');
        const username = configService.get<string>('POSTGRES_USER');
        const database = configService.get<string>('POSTGRES_DATABASE');
        const syncRaw = configService.get<string | boolean | undefined>(
          'POSTGRES_SYNCHRONIZE',
        );

        if (!host || !portRaw || !username || !database) {
          throw new Error('Missing required POSTGRES_* configuration');
        }

        const port = typeof portRaw === 'number' ? portRaw : Number(portRaw);
        const synchronize =
          typeof syncRaw === 'boolean' ? syncRaw : syncRaw === 'true';

        return {
          type: 'postgres',
          host,
          port,
          password: password ?? undefined,
          username,
          database,
          synchronize,
          autoLoadEntities: true,
          logging: false,
        } as const;
      },
    }),
  ],
})
export class DatabasesModule {
  constructor(private readonly configService: ConfigService) {
    const host = configService.get<string>('POSTGRES_HOST');
    console.log('🚀 ~ DatabasesModule ~ constructor ~ host:', host);
    const portRaw = configService.get<string | number | undefined>(
      'POSTGRES_PORT',
    );
    console.log('🚀 ~ DatabasesModule ~ constructor ~ portRaw:', portRaw);
    const password = configService.get<string>('POSTGRES_PASSWORD');
    console.log('🚀 ~ DatabasesModule ~ constructor ~ password:', password);
    const username = configService.get<string>('POSTGRES_USER');
    console.log('🚀 ~ DatabasesModule ~ constructor ~ username:', username);
    const database = configService.get<string>('POSTGRES_DATABASE');
    console.log('🚀 ~ DatabasesModule ~ constructor ~ database:', database);
    const syncRaw = configService.get<string | boolean | undefined>(
      'POSTGRES_SYNCHRONIZE',
    );
    console.log('🚀 ~ DatabasesModule ~ constructor ~ syncRaw:', syncRaw);
  }
}
