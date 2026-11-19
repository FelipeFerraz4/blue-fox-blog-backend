import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { CompatibilityController } from './compatibility/compatibility.controller';
import { CompatibilityService } from './compatibility/compatibility.service';
import { EquipmentController } from './equipment/equipment.controller';
import { EquipmentService } from './equipment/equipment.service';
import { SpeciesController } from './species/species.controller';
import { SpeciesService } from './species/species.service';

/**
 * Testes HTTP dos controllers do catálogo com os serviços mockados (mesmo padrão de posts.controller.spec):
 * ordem das rotas, idioma resolvido, visibilidade repassada e conversão dos filtros da query.
 * O ValidationPipe é o mesmo do main.ts.
 */
describe('Aquarismo controllers (HTTP)', () => {
  let app: INestApplication;
  const species = {
    findAll: jest.fn().mockResolvedValue([]),
    findBySlug: jest.fn().mockResolvedValue({}),
    findById: jest.fn().mockResolvedValue({}),
  };
  const compatibility = { check: jest.fn().mockResolvedValue({ level: 'COMPATIBLE' }) };
  const equipment = { findAll: jest.fn().mockResolvedValue([]), findBySlug: jest.fn().mockResolvedValue({}) };
  const UUID = '9f000004-28ab-4add-bbbb-112233445566';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SpeciesController, CompatibilityController, EquipmentController],
      providers: [
        { provide: SpeciesService, useValue: species },
        { provide: CompatibilityService, useValue: compatibility },
        { provide: EquipmentService, useValue: equipment },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    app.use((req: any, _res: any, next: () => void) => {
      const roles = req.headers['x-test-roles'];
      if (roles) req.user = { sub: 'u1', roles: String(roles).split(',') };
      next();
    });
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('routes slug/:slug before :id and resolves the locale', async () => {
    await request(app.getHttpServer()).get('/v1/aquarismo/species/slug/betta-splendens?lang=en').expect(200);
    expect(species.findBySlug).toHaveBeenCalledWith('betta-splendens', 'en', false);
    expect(species.findById).not.toHaveBeenCalled();

    await request(app.getHttpServer()).get(`/v1/aquarismo/species/${UUID}`).set('accept-language', 'en-US').expect(200);
    expect(species.findById).toHaveBeenCalledWith(UUID, 'en', false);
  });

  it('defaults to pt-BR and rejects a non-UUID id', async () => {
    await request(app.getHttpServer()).get('/v1/aquarismo/species/slug/x').expect(200);
    expect(species.findBySlug).toHaveBeenLastCalledWith('x', 'pt-BR', false);
    await request(app.getHttpServer()).get('/v1/aquarismo/species/not-a-uuid').expect(400);
  });

  it('converts filters: numbers, enums and "false" booleans', async () => {
    await request(app.getHttpServer())
      .get('/v1/aquarismo/species?temperature=25.5&volume=100&temperament=PEACEFUL&noFinNippers=false')
      .expect(200);
    const [query] = species.findAll.mock.calls[0];
    expect(query).toMatchObject({ temperature: 25.5, volume: 100, temperament: 'PEACEFUL', noFinNippers: false });

    await request(app.getHttpServer()).get('/v1/aquarismo/species?noFinNippers=true').expect(200);
    expect(species.findAll.mock.calls[1][0].noFinNippers).toBe(true);

    await request(app.getHttpServer()).get('/v1/aquarismo/species?temperament=XYZ').expect(400);
  });

  it('only content managers see unpublished items', async () => {
    await request(app.getHttpServer()).get('/v1/aquarismo/species').set('x-test-roles', 'ROLE_USER').expect(200);
    expect(species.findAll.mock.calls[0][2]).toBe(false);
    await request(app.getHttpServer()).get('/v1/aquarismo/species').set('x-test-roles', 'ROLE_AQUARIUM_EDITOR').expect(200);
    expect(species.findAll.mock.calls[1][2]).toBe(true);
  });

  it('splits the compatibility species list (keeping repeats)', async () => {
    await request(app.getHttpServer())
      .get('/v1/aquarismo/compatibility?species=betta-splendens, betta-splendens,paracheirodon-innesi&lang=en')
      .expect(200);
    expect(compatibility.check).toHaveBeenCalledWith(['betta-splendens', 'betta-splendens', 'paracheirodon-innesi'], 'en', false);
    await request(app.getHttpServer()).get('/v1/aquarismo/compatibility?species=Not_A_Slug').expect(400);
  });

  it('passes the volume to the equipment sizing', async () => {
    await request(app.getHttpServer()).get('/v1/aquarismo/equipment/slug/aquecedor?volume=120').expect(200);
    expect(equipment.findBySlug).toHaveBeenCalledWith('aquecedor', 'pt-BR', false, 120);
  });
});
