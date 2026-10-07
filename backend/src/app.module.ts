import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { loadEnvConfig } from './config/env.config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { LoggerModule } from './common/logger/logger.module';
import { ActionAuditLogInterceptor } from './common/interceptors/action-audit-log.interceptor';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { TenantModule } from './modules/tenant/tenant.module';
import { TenantMiddleware } from './modules/tenant/tenant.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { RolesGuard } from './modules/auth/roles.guard';
import { CategoriesModule } from './modules/categories/categories.module';
import { AuthorsModule } from './modules/authors/authors.module';
import { PostsModule } from './modules/posts/posts.module';
import { CommentsModule } from './modules/comments/comments.module';
import { BlogsModule } from './modules/blogs/blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvConfig],
      envFilePath: ['.env.dev', '.env.prod', '.env'],
    }),
    LoggerModule,
    PrismaModule,
    HealthModule,
    TenantModule,
    AuthModule,
    CategoriesModule,
    AuthorsModule,
    PostsModule,
    CommentsModule,
    BlogsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ActionAuditLogInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
