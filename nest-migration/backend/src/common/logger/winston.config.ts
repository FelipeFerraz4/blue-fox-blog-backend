import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';

const logBaseDir = path.resolve(process.cwd(), 'logs');

// Formato legível para o Console
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const ctx = context ? `[${context}] ` : '';
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${ctx}${message}${extra}`;
  }),
);

// Formato JSON estruturado para arquivos locais em disco
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.json(),
);

// Logger geral da aplicação (Console + logs/YYYY-MM-DD/app.log + logs/YYYY-MM-DD/error.log)
export const createWinstonLogger = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return winston.createLogger({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    transports: [
      new winston.transports.Console({
        format: consoleFormat,
      }),
      new (winston.transports as any).DailyRotateFile({
        dirname: path.join(logBaseDir, '%DATE%'),
        filename: 'app.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'info',
        format: fileFormat,
      }),
      new (winston.transports as any).DailyRotateFile({
        dirname: path.join(logBaseDir, '%DATE%'),
        filename: 'error.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '60d',
        level: 'error',
        format: fileFormat,
      }),
    ],
  });
};

// Logger dedicado exclusivo para auditoria de ações (logs/YYYY-MM-DD/actions.log)
export const actionsAuditLogger = winston.createLogger({
  level: 'info',
  transports: [
    new (winston.transports as any).DailyRotateFile({
      dirname: path.join(logBaseDir, '%DATE%'),
      filename: 'actions.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '90d',
      format: fileFormat,
    }),
  ],
});
