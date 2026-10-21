import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

/**
 * Testes HTTP do controller com o serviço mockado. Os guards globais (JWT e papéis) são registrados no
 * AppModule, não aqui; o middleware abaixo simula o que o JwtAuthGuard faz em rotas públicas com token:
 * preenche `req.user` com as roles do cabeçalho `x-test-roles`.
 */
describe('PostsController (HTTP)', () => {
  let app: INestApplication;
  const service = {
    findAll: jest.fn().mockResolvedValue([]),
    findAllActive: jest.fn().mockResolvedValue([]),
    findAllByStatus: jest.fn().mockResolvedValue([]),
    findBySlug: jest.fn().mockResolvedValue({ id: 'p1' }),
    findById: jest.fn().mockResolvedValue({ id: 'p1' }),
    findRecommendedPosts: jest.fn().mockResolvedValue([]),
    findNextPosts: jest.fn().mockResolvedValue([]),
    search: jest.fn().mockResolvedValue([]),
  };
  const UUID = '9f000004-28ab-4add-bbbb-112233445566';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: service }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use((req: any, _res: any, next: () => void) => {
      const roles = req.headers['x-test-roles'];
      if (roles) req.user = { sub: 'u1', roles: String(roles).split(',') };
      next();
    });
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('GET /v1/posts/all is reachable (it used to be captured by :id and answered 400)', async () => {
    await request(app.getHttpServer()).get('/v1/posts/all').expect(200);
    expect(service.findAll).toHaveBeenCalledWith(false);
    expect(service.findById).not.toHaveBeenCalled();
  });

  it('GET /v1/posts/status/:status is routed to the status listing, not to :id', async () => {
    await request(app.getHttpServer()).get('/v1/posts/status/ACTIVE').expect(200);
    expect(service.findAllByStatus).toHaveBeenCalledWith('ACTIVE', false);
  });

  it('GET /v1/posts/search is routed to search, not to :id', async () => {
    await request(app.getHttpServer()).get('/v1/posts/search?q=betta&limit=5').expect(200);
    expect(service.search).toHaveBeenCalledWith('betta', 5, false);
  });

  it('still routes a UUID to findById and a slug to findBySlug', async () => {
    await request(app.getHttpServer()).get(`/v1/posts/${UUID}`).expect(200);
    expect(service.findById).toHaveBeenCalledWith(UUID, false);

    await request(app.getHttpServer()).get('/v1/posts/slug/tetra-fish-guide').expect(200);
    expect(service.findBySlug).toHaveBeenCalledWith('tetra-fish-guide', false);
  });

  it('anonymous visitors and users without a content role never get drafts', async () => {
    await request(app.getHttpServer()).get('/v1/posts').expect(200);
    expect(service.findAllActive).toHaveBeenLastCalledWith(false);

    await request(app.getHttpServer()).get('/v1/posts/slug/x').set('x-test-roles', 'ROLE_USER,ROLE_FINANCE_ADMIN').expect(200);
    expect(service.findBySlug).toHaveBeenLastCalledWith('x', false);
  });

  it('editors and admins get drafts on every public read route', async () => {
    const editor = { 'x-test-roles': 'ROLE_AQUARIUM_EDITOR' };

    await request(app.getHttpServer()).get('/v1/posts').set(editor).expect(200);
    expect(service.findAllActive).toHaveBeenLastCalledWith(true);

    await request(app.getHttpServer()).get('/v1/posts/all').set(editor).expect(200);
    expect(service.findAll).toHaveBeenLastCalledWith(true);

    await request(app.getHttpServer()).get('/v1/posts/status/DELETED').set(editor).expect(200);
    expect(service.findAllByStatus).toHaveBeenLastCalledWith('DELETED', true);

    await request(app.getHttpServer()).get('/v1/posts/slug/tetra-fish-guide').set(editor).expect(200);
    expect(service.findBySlug).toHaveBeenLastCalledWith('tetra-fish-guide', true);

    await request(app.getHttpServer()).get(`/v1/posts/${UUID}`).set({ 'x-test-roles': 'ROLE_ADMIN' }).expect(200);
    expect(service.findById).toHaveBeenLastCalledWith(UUID, true);

    await request(app.getHttpServer()).get('/v1/posts/recommended-posts/tetra-fish-guide').set(editor).expect(200);
    expect(service.findRecommendedPosts).toHaveBeenLastCalledWith('tetra-fish-guide', true);

    await request(app.getHttpServer()).get('/v1/posts/next-posts/tetra-fish-guide').set(editor).expect(200);
    expect(service.findNextPosts).toHaveBeenLastCalledWith('tetra-fish-guide', 6, true);
  });
});
