import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateStatusDto } from '../../../common/dto/update-status.dto';
import { canSeeInactive } from '../../auth/content-visibility';
import { CurrentUser } from '../../auth/current-user.decorator';
import { KeycloakUser } from '../../auth/jwt.strategy';
import { Public } from '../../auth/public.decorator';
import { KeycloakRole } from '../../auth/roles.constants';
import { Roles } from '../../auth/roles.decorator';
import { RequestLocale, SUPPORTED_LOCALES, SupportedLocale } from '../common/locale';
import { CreateFamilyDto, UpdateFamilyDto } from './dto/family.dto';
import { FamiliesService } from './families.service';

const WRITE_ROLES = [KeycloakRole.ADMIN, KeycloakRole.AQUARIUM_ADMIN, KeycloakRole.AQUARIUM_EDITOR];

@ApiTags('Aquarismo - Families')
@Controller('v1/aquarismo/families')
export class FamiliesController {
  constructor(private readonly families: FamiliesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List fish families', description: 'Includes how many visible species each family has' })
  @ApiQuery({ name: 'lang', required: false, enum: SUPPORTED_LOCALES })
  @ApiResponse({ status: 200, description: 'Families found' })
  findAll(@RequestLocale() locale: SupportedLocale, @CurrentUser() user: KeycloakUser | null) {
    return this.families.findAll(locale, canSeeInactive(user));
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Find family by slug' })
  @ApiParam({ name: 'slug', example: 'characidae' })
  @ApiQuery({ name: 'lang', required: false, enum: SUPPORTED_LOCALES })
  @ApiResponse({ status: 200, description: 'Family found' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  findBySlug(@Param('slug') slug: string, @RequestLocale() locale: SupportedLocale, @CurrentUser() user: KeycloakUser | null) {
    return this.families.findBySlug(slug, locale, canSeeInactive(user));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a family' })
  @ApiResponse({ status: 201, description: 'Family created' })
  @ApiResponse({ status: 409, description: 'Slug or scientific name already in use' })
  create(@Body() dto: CreateFamilyDto, @RequestLocale() locale: SupportedLocale) {
    return this.families.create(dto, locale);
  }

  @Put(':id')
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a family' })
  @ApiParam({ name: 'id', description: 'Family id (UUID)' })
  @ApiResponse({ status: 200, description: 'Family updated' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFamilyDto, @RequestLocale() locale: SupportedLocale) {
    return this.families.update(id, dto, locale);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(...WRITE_ROLES)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update family status (DELETED works as soft delete)' })
  @ApiParam({ name: 'id', description: 'Family id (UUID)' })
  @ApiResponse({ status: 204, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Family not found' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStatusDto) {
    return this.families.updateStatus(id, dto.status);
  }
}
