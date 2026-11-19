import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { canSeeUnpublished } from '../../auth/content-visibility';
import { CurrentUser } from '../../auth/current-user.decorator';
import { KeycloakUser } from '../../auth/jwt.strategy';
import { Public } from '../../auth/public.decorator';
import { KeycloakRole } from '../../auth/roles.constants';
import { Roles } from '../../auth/roles.decorator';
import { RequestLocale, SupportedLocale } from '../common/locale';
import { CompatibilityService } from './compatibility.service';
import { CompatibilityQueryDto, UpsertCompatibilityOverrideDto } from './dto/compatibility.dto';

@ApiTags('Aquarismo - Compatibility')
@Controller('v1/aquarismo/compatibility')
export class CompatibilityController {
  constructor(private readonly compatibility: CompatibilityService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Check species compatibility',
    description:
      'Evaluates every pair of the given species (temperature, pH, water type, temperament, fin nipping, ' +
      'size and same-species aggression) and returns COMPATIBLE, ATTENTION or INCOMPATIBLE with the reasons.',
  })
  @ApiResponse({ status: 200, description: 'Compatibility evaluated' })
  @ApiResponse({ status: 400, description: 'Fewer than two species' })
  @ApiResponse({ status: 404, description: 'A species was not found' })
  check(@Query() query: CompatibilityQueryDto, @RequestLocale() locale: SupportedLocale, @CurrentUser() user: KeycloakUser | null) {
    return this.compatibility.check(query.species, locale, canSeeUnpublished(user));
  }

  @Put('overrides')
  @Roles(KeycloakRole.ADMIN, KeycloakRole.AQUARIUM_ADMIN, KeycloakRole.AQUARIUM_EDITOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create or update a manual compatibility exception for a pair of species' })
  @ApiResponse({ status: 200, description: 'Exception saved' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  upsertOverride(@Body() dto: UpsertCompatibilityOverrideDto) {
    return this.compatibility.upsertOverride(dto);
  }

  @Delete('overrides/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(KeycloakRole.ADMIN, KeycloakRole.AQUARIUM_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove a manual compatibility exception' })
  @ApiParam({ name: 'id', description: 'Exception id (UUID)' })
  @ApiResponse({ status: 204, description: 'Exception removed' })
  @ApiResponse({ status: 404, description: 'Exception not found' })
  removeOverride(@Param('id', ParseUUIDPipe) id: string) {
    return this.compatibility.removeOverride(id);
  }
}
