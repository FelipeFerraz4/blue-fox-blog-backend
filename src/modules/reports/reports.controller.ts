import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../auth/public.decorator';
import { KeycloakRole } from '../auth/roles.constants';
import { Roles } from '../auth/roles.decorator';
import { CreateReportDto, ReportQueryDto, UpdateReportDto } from './dto/report.dto';
import { clientIp } from './report-rate-limiter';
import { ReportsService } from './reports.service';

const EDITOR_ROLES = [KeycloakRole.ADMIN, KeycloakRole.AQUARIUM_ADMIN, KeycloakRole.AQUARIUM_EDITOR];

@ApiTags('Report')
@Controller('v1/reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Report an error in the content',
    description: 'Public and private: the report is only visible to editors. Limited to 5 reports per IP every 10 minutes.',
  })
  @ApiResponse({ status: 201, description: 'Report received' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 429, description: 'Too many reports from this address' })
  create(@Body() dto: CreateReportDto, @Req() req: Request) {
    return this.reports.create(dto, clientIp(req.headers, req.ip));
  }

  @Get()
  @Roles(...EDITOR_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List reports (newest first)', description: 'Filter by status, target type or target slug' })
  @ApiResponse({ status: 200, description: 'Reports found' })
  findAll(@Query() query: ReportQueryDto) {
    return this.reports.findAll(query);
  }

  @Get(':id')
  @Roles(...EDITOR_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Find report by id' })
  @ApiParam({ name: 'id', description: 'Report id (UUID)' })
  @ApiResponse({ status: 200, description: 'Report found' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.reports.findById(id);
  }

  @Patch(':id')
  @Roles(...EDITOR_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update report status or internal note' })
  @ApiParam({ name: 'id', description: 'Report id (UUID)' })
  @ApiResponse({ status: 200, description: 'Report updated' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateReportDto) {
    return this.reports.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(KeycloakRole.ADMIN, KeycloakRole.AQUARIUM_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Permanently delete a report (e.g. a reader asked to erase their e-mail)' })
  @ApiParam({ name: 'id', description: 'Report id (UUID)' })
  @ApiResponse({ status: 204, description: 'Report deleted' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reports.remove(id);
  }
}
