import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppLoggerService } from './common/logger/app-logger.service';

// Polyfill para serialização segura de BigInt do Prisma para JSON
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const appLogger = new AppLoggerService();
  const app = await NestFactory.create(AppModule, {
    logger: appLogger,
  });

  // Cookie parser para suporte ao transporte via cookies
  app.use(cookieParser());

  // Prefixo global para todas as rotas
  app.setGlobalPrefix('api');

  // CORS habilitado para frontend e clientes Blue Fox
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validação estrita e transformação automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger OpenAPI Configuration (100% in English)
  const swaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Blue Fox Blog API')
      .setDescription(
        'Enterprise NestJS REST API with Prisma ORM for the Blue Fox Blog ecosystem. Features multi-tenancy isolation via X-Blog-ID and stateless OAuth2 Keycloak JWT authentication.',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Insert Keycloak Bearer JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addGlobalParameters({
        name: 'X-Blog-ID',
        in: 'header',
        required: false,
        description: 'Tenant Blog UUID context header. Example: 77e2c400-28ab-4add-b219-112233445566',
        schema: {
          type: 'string',
          format: 'uuid',
          default: '77e2c400-28ab-4add-b219-112233445566',
        },
      })
      .addTag('Health', 'System and database health check probes for Docker/Kubernetes')
      .addTag('Category', 'Category management and taxonomy endpoints')
      .addTag('Author', 'Author profiles and metadata management')
      .addTag('Post', 'Blog post publishing, automated recommendations and metrics')
      .addTag('Comment', 'Reader comments and moderation workflows')
      .addTag('Blog', 'Multi-tenant blog metadata and discovery')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Blue Fox Blog API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
      },
    });
    appLogger.log('📄 Swagger documentation available at: /api/docs', 'Bootstrap');
  }

  const port = process.env.BACKEND_PORT || process.env.PORT || 8081;
  await app.listen(port);
  appLogger.log(`🚀 Blue Fox Blog API running on http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();
