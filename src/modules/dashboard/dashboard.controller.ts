import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { KeycloakRole } from '../auth/roles.constants';
import { Roles } from '../auth/roles.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('stats')
  @Roles(KeycloakRole.ADMIN, KeycloakRole.AQUARIUM_ADMIN, KeycloakRole.AQUARIUM_EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Admin dashboard numbers',
    description:
      'Posts by category (published/drafts) and most read; species by publication, family and biome, ' +
      'and species without review for months; reports by status, pending and latest.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  stats() {
    return this.dashboard.stats();
  }
}
