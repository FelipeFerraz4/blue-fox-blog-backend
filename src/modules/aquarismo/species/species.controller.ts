import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateStatusDto } from '../../../common/dto/update-status.dto';
import { canSeeUnpublished } from '../../auth/content-visibility';
import { CurrentUser } from '../../auth/current-user.decorator';
import { KeycloakUser } from '../../auth/jwt.strategy';
import { Public } from '../../auth/public.decorator';
import { KeycloakRole } from '../../auth/roles.constants';
import { Roles } from '../../auth/roles.decorator';
import { RequestLocale, SUPPORTED_LOCALES, SupportedLocale } from '../common/locale';
import { CreateSpeciesDto, SpeciesQueryDto, UpdateSpeciesDto } from './dto/species.dto';
import { SpeciesService } from './species.service';

const WRITE_ROLES = [KeycloakRole.ADMIN, KeycloakRole.AQUARIUM_ADMIN, KeycloakRole.AQUARIUM_EDITOR];
const DELETE_ROLES = [KeycloakRole.ADMIN, KeycloakRole.AQUARIUM_ADMIN];

@ApiTags('Aquarismo - Species')
@Controller('v1/aquarismo/species')
export class SpeciesController {
  constructor(private readonly species: SpeciesService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List species with filters',
    description: 'Published species for visitors; editors and admins also see drafts. Filters can be combined.',
  })
  @ApiResponse({ status: 200, description: 'Species found' })
  findAll(@Query() query: SpeciesQueryDto, @RequestLocale() locale: SupportedLocale, @CurrentUser() user: KeycloakUser | null) {
    return this.species.findAll(query, locale, canSeeUnpublished(user));
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Find species by slug' })
  @ApiParam({ name: 'slug', example: 'paracheirodon-innesi' })
  @ApiQuery({ name: 'lang', required: false, enum: SUPPORTED_LOCALES })
  @ApiResponse({ status: 200, description: 'Species found' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  findBySlug(@Param('slug') slug: string, @RequestLocale() locale: SupportedLocale, @CurrentUser() user: KeycloakUser | null) {
    return this.species.findBySlug(slug, locale, canSeeUnpublished(user));
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Find species by id' })
  @ApiParam({ name: 'id', description: 'Species id (UUID)' })
  @ApiQuery({ name: 'lang', required: false, enum: SUPPORTED_LOCALES })
  @ApiResponse({ status: 200, description: 'Species found' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @RequestLocale() locale: SupportedLocale,
    @CurrentUser() user: KeycloakUser | null,
  ) {
    return this.species.findById(id, locale, canSeeUnpublished(user));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a species', description: 'Requires the default locale (pt-BR) translation' })
  @ApiResponse({ status: 201, description: 'Species created' })
  @ApiResponse({ status: 400, description: 'Invalid data, missing default translation or unknown family/biome' })
  @ApiResponse({ status: 409, description: 'Slug or scientific name already in use' })
  create(@Body() dto: CreateSpeciesDto, @RequestLocale() locale: SupportedLocale) {
    return this.species.create(dto, locale);
  }

  @Put(':id')
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a species', description: 'Partial update; translations are upserted per locale' })
  @ApiParam({ name: 'id', description: 'Species id (UUID)' })
  @ApiResponse({ status: 200, description: 'Species updated' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  @ApiResponse({ status: 409, description: 'Slug or scientific name already in use' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSpeciesDto, @RequestLocale() locale: SupportedLocale) {
    return this.species.update(id, dto, locale);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update species status' })
  @ApiParam({ name: 'id', description: 'Species id (UUID)' })
  @ApiResponse({ status: 204, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto) {
    return this.species.updateStatus(id, dto.status);
  }

  @Delete('hard/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(...DELETE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Permanently delete a species' })
  @ApiParam({ name: 'id', description: 'Species id (UUID)' })
  @ApiResponse({ status: 204, description: 'Species deleted' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.species.hardDelete(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(...DELETE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete a species (status DELETED)' })
  @ApiParam({ name: 'id', description: 'Species id (UUID)' })
  @ApiResponse({ status: 204, description: 'Species deleted' })
  @ApiResponse({ status: 404, description: 'Species not found' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.species.softDelete(id);
  }
}
