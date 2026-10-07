import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContext, DEFAULT_TENANT_ID } from './tenant.context';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const rawHeader = req.headers['x-blog-id'];
    const rawCookie = req.cookies?.blog_id;

    const tenantCandidate = (
      Array.isArray(rawHeader) ? rawHeader[0] : rawHeader
    ) || rawCookie;

    if (tenantCandidate) {
      const cleanTenant = tenantCandidate.trim();
      if (!UUID_REGEX.test(cleanTenant)) {
        throw new BadRequestException('Invalid X-Blog-ID format.');
      }
      return TenantContext.run(cleanTenant, next);
    }

    // Caso não fornecido, adota o tenant padrão do ecossistema Blue Fox
    return TenantContext.run(DEFAULT_TENANT_ID, next);
  }
}
