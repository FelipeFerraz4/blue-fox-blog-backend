import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Blue Fox Blog Backend (E2E Integration Tests)', () => {
  let app: INestApplication;
  let mockPrismaService: any;

  beforeAll(async () => {
    mockPrismaService = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
      category: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'c1111111-28ab-4add-aaaa-112233445566',
            name: 'Itens do Aquarismo',
            slug: 'itens-do-aquarismo',
            status: 'ACTIVE',
          },
        ]),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      post: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
      },
      blog: {
        findUnique: jest.fn().mockResolvedValue({
          id: '77e2c400-28ab-4add-b219-112233445566',
          name: 'Blue Fox Aquarismo',
          slug: 'blue-fox-aquarismo',
          status: 'ACTIVE',
        }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Probes (/api/health)', () => {
    it('should return 200 OK with database status when healthy', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.info).toHaveProperty('database');
          expect(res.body.info.database.status).toBe('up');
        });
    });
  });

  describe('Multi-Tenancy Middleware (X-Blog-ID & Cookie)', () => {
    it('should reject invalid UUID header format with 400 Bad Request', () => {
      return request(app.getHttpServer())
        .get('/api/v1/categories')
        .set('X-Blog-ID', 'invalid-uuid-format')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body.status).toBe(400);
          expect(res.body.error).toBe('Bad Request');
          expect(res.body.message).toBe('Invalid X-Blog-ID format.');
        });
    });

    it('should accept valid UUID header and proceed', () => {
      return request(app.getHttpServer())
        .get('/api/v1/categories')
        .set('X-Blog-ID', '77e2c400-28ab-4add-b219-112233445566')
        .expect(200);
    });
  });

  describe('Security & Public Access Rules', () => {
    it('should allow public GET request to categories without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200);
    });

    it('should block protected POST request to categories when token is missing (401 Unauthorized)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/categories')
        .send({
          name: 'New Test Category',
          description: 'Test category description',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.status).toBe(401);
          expect(res.body.error).toBe('Unauthorized');
        });
    });
  });

  describe('Standardized Error Format (ErrorResponseDto)', () => {
    it('should return error conforming to ErrorResponseDto structure', () => {
      return request(app.getHttpServer())
        .get('/api/v1/categories/00000000-0000-0000-0000-000000000000')
        .expect(404)
        .expect((res) => {
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('status', 404);
          expect(res.body).toHaveProperty('error', 'Not Found');
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('path');
        });
    });
  });
});
