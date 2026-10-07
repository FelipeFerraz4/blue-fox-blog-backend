import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { actionsAuditLogger } from '../logger/winston.config';

@Injectable()
export class ActionAuditLogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();

    const startTime = Date.now();
    const { method, originalUrl, headers, cookies } = req;
    const ip = (headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || req.socket.remoteAddress;
    const tenantId = headers['x-blog-id'] || cookies?.blog_id || null;
    const user = (req as any).user?.preferred_username || (req as any).user?.email || (req as any).user?.sub || 'anonymous';

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const statusCode = res.statusCode;

          actionsAuditLogger.info('HTTP Action Completed', {
            method,
            url: originalUrl,
            statusCode,
            durationMs,
            tenantId,
            user,
            ip,
            userAgent: headers['user-agent'],
          });
        },
        error: (err: any) => {
          const durationMs = Date.now() - startTime;
          const statusCode = err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

          actionsAuditLogger.warn('HTTP Action Failed', {
            method,
            url: originalUrl,
            statusCode,
            durationMs,
            tenantId,
            user,
            ip,
            userAgent: headers['user-agent'],
            errorMessage: err?.message || 'Unknown error',
          });
        },
      }),
    );
  }
}
