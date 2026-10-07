import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
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

  // Configuração do Swagger OpenAPI
  const swaggerEnabled = process.env.SWAGGER_ENABLED !== 'false';
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Blue Fox Blog API')
      .setDescription(
        'Backend NestJS com Prisma para o ecossistema do Blog Blue Fox. Suporta multi-tenancy e autenticação Keycloak.',
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Insira o token JWT emitido pelo Keycloak',
          in: 'header',
        },
        'JWT-auth',
      )
      .addGlobalParameters({
        name: 'X-Blog-ID',
        in: 'header',
        required: false,
        description: 'UUID do blog (multi-tenant context). Exemplo: 77e2c400-28ab-4add-b219-112233445566',
        schema: {
          type: 'string',
          format: 'uuid',
          default: '77e2c400-28ab-4add-b219-112233445566',
        },
      })
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      customSiteTitle: 'Blue Fox Blog API Docs',
    });
    appLogger.log('📄 Swagger UI disponível em: /api/docs', 'Bootstrap');
  }

  const port = process.env.BACKEND_PORT || process.env.PORT || 3000;
  await app.listen(port);
  appLogger.log(`🚀 Blue Fox Blog API rodando em http://localhost:${port}/api`, 'Bootstrap');
}

bootstrap();
