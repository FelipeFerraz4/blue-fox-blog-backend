import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateStatusDto } from '../../../common/dto/update-status.dto';
import { canSeeUnpublished } from '../../auth/content-visibility';
import { CurrentUser } from '../../auth/current-user.decorator';
import { KeycloakUser } from '../../auth/jwt.strategy';
import { Public } from '../../auth/public.decorator';
import { KeycloakRole } from '../../auth/roles.constants';
import { Roles } from '../../auth/roles.decorator';
import { RequestLocale, SUPPORTED_LOCALES, SupportedLocale } from '../common/locale';
import { CreateEquipmentDto, EquipmentQueryDto, UpdateEquipmentDto } from './dto/equipment.dto';
import { EquipmentService } from './equipment.service';

const WRITE_ROLES = [KeycloakRole.ADMIN, KeycloakRole.AQUARIUM_ADMIN, KeycloakRole.AQUARIUM_EDITOR];

@ApiTags('Aquarismo - Equipment')
@Controller('v1/aquarismo/equipment')
export class EquipmentController {
  constructor(private readonly equipment: EquipmentService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List equipment categories',
    description: 'With ?volume=, filters by volume range and adds the recommended size (e.g. heater watts, filter L/h)',
  })
  @ApiResponse({ status: 200, description: 'Equipment found' })
  findAll(@Query() query: EquipmentQueryDto, @RequestLocale() locale: SupportedLocale, @CurrentUser() user: KeycloakUser | null) {
    return this.equipment.findAll(query, locale, canSeeUnpublished(user));
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Find equipment by slug' })
  @ApiParam({ name: 'slug', example: 'aquecedor' })
  @ApiQuery({ name: 'lang', required: false, enum: SUPPORTED_LOCALES })
  @ApiQuery({ name: 'volume', required: false, type: Number, description: 'Tank volume (L) for the recommended size' })
  @ApiResponse({ status: 200, description: 'Equipment found' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  findBySlug(
    @Param('slug') slug: string,
    @Query() query: EquipmentQueryDto,
    @RequestLocale() locale: SupportedLocale,
    @CurrentUser() user: KeycloakUser | null,
  ) {
    return this.equipment.findBySlug(slug, locale, canSeeUnpublished(user), query.volume);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create an equipment category' })
  @ApiResponse({ status: 201, description: 'Equipment created' })
  @ApiResponse({ status: 409, description: 'Slug already in use' })
  create(@Body() dto: CreateEquipmentDto, @RequestLocale() locale: SupportedLocale) {
    return this.equipment.create(dto, locale);
  }

  @Put(':id')
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an equipment category' })
  @ApiParam({ name: 'id', description: 'Equipment id (UUID)' })
  @ApiResponse({ status: 200, description: 'Equipment updated' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEquipmentDto, @RequestLocale() locale: SupportedLocale) {
    return this.equipment.update(id, dto, locale);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update equipment status (DELETED works as soft delete)' })
  @ApiParam({ name: 'id', description: 'Equipment id (UUID)' })
  @ApiResponse({ status: 204, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Equipment not found' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto) {
    return this.equipment.updateStatus(id, dto.status);
  }
}
