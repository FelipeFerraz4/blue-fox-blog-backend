import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { createWinstonLogger } from './winston.config';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = createWinstonLogger();
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug?(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose?(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }
}
