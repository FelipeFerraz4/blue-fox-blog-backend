import { BadRequestException } from '@nestjs/common';
import { TenantMiddleware } from './tenant.middleware';
import { TenantContext } from './tenant.context';

describe('TenantMiddleware (Unit Tests)', () => {
  let middleware: TenantMiddleware;

  beforeEach(() => {
    middleware = new TenantMiddleware();
  });

  it('should accept valid UUID in X-Blog-ID header and populate TenantContext', (done) => {
    const validUuid = '77e2c400-28ab-4add-b219-112233445566';
    const req: any = {
      headers: {
        'x-blog-id': validUuid,
      },
      cookies: {},
    };
    const res: any = {};
    const next = () => {
      expect(TenantContext.getTenantId()).toBe(validUuid);
      done();
    };

    middleware.use(req, res, next);
  });

  it('should fallback to blog_id cookie when header is absent', (done) => {
    const validUuid = '11111111-2222-3333-4444-555555555555';
    const req: any = {
      headers: {},
      cookies: {
        blog_id: validUuid,
      },
    };
    const res: any = {};
    const next = () => {
      expect(TenantContext.getTenantId()).toBe(validUuid);
      done();
    };

    middleware.use(req, res, next);
  });

  it('should throw BadRequestException when tenant ID is not a valid UUID', () => {
    const req: any = {
      headers: {
        'x-blog-id': 'invalid-uuid',
      },
      cookies: {},
    };
    const res: any = {};
    const next = jest.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
    expect(next).not.toHaveBeenCalled();
  });
});
