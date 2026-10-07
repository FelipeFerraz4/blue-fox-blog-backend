import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { loadEnvConfig } from './config/env.config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvConfig],
      envFilePath: ['.env.dev', '.env.prod', '.env'],
    }),
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
