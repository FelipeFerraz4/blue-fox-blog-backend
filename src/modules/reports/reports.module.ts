import { Module } from '@nestjs/common';
import { ReportRateLimiter } from './report-rate-limiter';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportRateLimiter],
})
export class ReportsModule {}
