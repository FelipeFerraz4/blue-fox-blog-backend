import { HttpException, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ReportStatus, ReportTargetType } from '@prisma/client';
import * as request from 'supertest';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../tenant/tenant.context';
import { clientIp, ReportRateLimiter } from './report-rate-limiter';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportRateLimiter', () => {
  it('allows 5 reports per IP in 10 minutes, then blocks until the window passes', () => {
    const limiter = new ReportRateLimiter();
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) expect(limiter.allow('1.1.1.1', t0 + i)).toBe(true);
    expect(limiter.allow('1.1.1.1', t0 + 10)).toBe(false);
    expect(limiter.allow('2.2.2.2', t0 + 10)).toBe(true);
    expect(limiter.allow('1.1.1.1', t0 + ReportRateLimiter.WINDOW_MS + 5)).toBe(true);
  });
});

describe('clientIp', () => {
  it('uses the last X-Forwarded-For entry (the one added by our proxy)', () => {
    expect(clientIp({ 'x-forwarded-for': '6.6.6.6, 10.0.0.9' })).toBe('10.0.0.9');
    expect(clientIp({ 'x-real-ip': '3.3.3.3' })).toBe('3.3.3.3');
    expect(clientIp({}, '::1')).toBe('::1');
  });
});

describe('ReportsService', () => {
  const prisma = {
    report: {
      create: jest.fn().mockResolvedValue({}),
      findFirst: jest.fn(),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve(data)),
    },
  };
  const dto = { targetType: ReportTargetType.SPECIES, targetSlug: 'betta-splendens', message: 'A temperatura está errada.' };
  let service: ReportsService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(TenantContext, 'getTenantId').mockReturnValue('blog-1');
    service = new ReportsService(prisma as unknown as PrismaService, new ReportRateLimiter());
  });

  it('saves a report with the tenant and never returns its data', async () => {
    await expect(service.create(dto, 'ip')).resolves.toEqual({ received: true });
    expect(prisma.report.create).toHaveBeenCalledWith({ data: { ...dto, blogId: 'blog-1' } });
  });

  it('answers success to bots that fill the honeypot, without saving', async () => {
    await expect(service.create({ ...dto, website: 'http://spam' }, 'ip')).resolves.toEqual({ received: true });
    expect(prisma.report.create).not.toHaveBeenCalled();
  });

  it('answers 429 after the per-IP limit', async () => {
    for (let i = 0; i < 5; i++) await service.create(dto, 'same-ip');
    await expect(service.create(dto, 'same-ip')).rejects.toBeInstanceOf(HttpException);
  });

  it('fills resolvedAt when fixed/dismissed and clears it when reopened', async () => {
    prisma.report.findFirst.mockResolvedValue({ id: 'r1' });
    const fixed = await service.update('r1', { status: ReportStatus.FIXED });
    expect(fixed.resolvedAt).toBeInstanceOf(Date);
    const reopened = await service.update('r1', { status: ReportStatus.IN_REVIEW, internalNote: 'Conferindo' });
    expect(reopened).toMatchObject({ resolvedAt: null, internalNote: 'Conferindo' });
  });
});

describe('ReportsController (HTTP)', () => {
  let app: INestApplication;
  const service = { create: jest.fn().mockResolvedValue({ received: true }), findAll: jest.fn().mockResolvedValue([]) };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: service }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('validates and trims the public report, passing the client IP', async () => {
    await request(app.getHttpServer())
      .post('/v1/reports')
      .set('x-forwarded-for', '9.9.9.9')
      .send({ targetType: 'POST', targetSlug: 'tetra-fish-guide', message: '  O pH ideal está errado  ', email: '', extra: 'x' })
      .expect(201);
    const [dto, ip] = service.create.mock.calls[0];
    expect(dto).toEqual({ targetType: 'POST', targetSlug: 'tetra-fish-guide', message: 'O pH ideal está errado' });
    expect(ip).toBe('9.9.9.9');
  });

  it('rejects short messages, bad e-mails and unknown targets', async () => {
    const server = app.getHttpServer();
    await request(server).post('/v1/reports').send({ targetType: 'POST', targetSlug: 'x', message: 'curto' }).expect(400);
    await request(server)
      .post('/v1/reports')
      .send({ targetType: 'POST', targetSlug: 'x', message: 'mensagem longa o bastante', email: 'nao-e-email' })
      .expect(400);
    await request(server).post('/v1/reports').send({ targetType: 'USER', targetSlug: 'x', message: 'mensagem longa o bastante' }).expect(400);
    expect(service.create).not.toHaveBeenCalled();
  });
});
