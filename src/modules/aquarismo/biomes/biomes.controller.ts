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
import { BiomesService } from './biomes.service';
import { BiomeQueryDto, CreateBiomeDto, UpdateBiomeDto } from './dto/biome.dto';

const WRITE_ROLES = [KeycloakRole.ADMIN, KeycloakRole.AQUARIUM_ADMIN, KeycloakRole.AQUARIUM_EDITOR];

@ApiTags('Aquarismo - Biomes')
@Controller('v1/aquarismo/biomes')
export class BiomesController {
  constructor(private readonly biomes: BiomesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List biomes', description: 'Each biome lists its visible species' })
  @ApiResponse({ status: 200, description: 'Biomes found' })
  findAll(@Query() query: BiomeQueryDto, @RequestLocale() locale: SupportedLocale, @CurrentUser() user: KeycloakUser | null) {
    return this.biomes.findAll(query, locale, canSeeUnpublished(user));
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Find biome by slug' })
  @ApiParam({ name: 'slug', example: 'amazonia' })
  @ApiQuery({ name: 'lang', required: false, enum: SUPPORTED_LOCALES })
  @ApiResponse({ status: 200, description: 'Biome found' })
  @ApiResponse({ status: 404, description: 'Biome not found' })
  findBySlug(@Param('slug') slug: string, @RequestLocale() locale: SupportedLocale, @CurrentUser() user: KeycloakUser | null) {
    return this.biomes.findBySlug(slug, locale, canSeeUnpublished(user));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a biome' })
  @ApiResponse({ status: 201, description: 'Biome created' })
  @ApiResponse({ status: 409, description: 'Slug already in use' })
  create(@Body() dto: CreateBiomeDto, @RequestLocale() locale: SupportedLocale) {
    return this.biomes.create(dto, locale);
  }

  @Put(':id')
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a biome' })
  @ApiParam({ name: 'id', description: 'Biome id (UUID)' })
  @ApiResponse({ status: 200, description: 'Biome updated' })
  @ApiResponse({ status: 404, description: 'Biome not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBiomeDto, @RequestLocale() locale: SupportedLocale) {
    return this.biomes.update(id, dto, locale);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update biome status (DELETED works as soft delete)' })
  @ApiParam({ name: 'id', description: 'Biome id (UUID)' })
  @ApiResponse({ status: 204, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Biome not found' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto) {
    return this.biomes.updateStatus(id, dto.status);
  }
}
