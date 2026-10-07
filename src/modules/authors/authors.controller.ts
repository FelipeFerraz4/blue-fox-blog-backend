import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { UpdateStatusDto } from '../../common/dto/update-status.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { Status } from '@prisma/client';

@ApiTags('Author')
@Controller('v1/authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new author', description: 'Create a new author with the provided data' })
  @ApiResponse({ status: 201, description: 'Author created successfully' })
  @ApiResponse({ status: 409, description: 'Author already exists' })
  create(@Body() dto: CreateAuthorDto) {
    return this.authorsService.create(dto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Find author by id', description: 'Find an author by its id' })
  @ApiParam({ name: 'id', description: 'Author id (UUID)' })
  @ApiResponse({ status: 200, description: 'Author found' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.authorsService.findById(id);
  }

  @Get('name/:name')
  @Public()
  @ApiOperation({ summary: 'Find author by name', description: 'Find an author by its name' })
  @ApiParam({ name: 'name', description: 'Author name' })
  @ApiResponse({ status: 200, description: 'Author found' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  findByName(@Param('name') name: string) {
    return this.authorsService.findByName(name);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Find author by slug', description: 'Find an author by its slug' })
  @ApiParam({ name: 'slug', description: 'Author slug' })
  @ApiResponse({ status: 200, description: 'Author found' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.authorsService.findBySlug(slug);
  }

  @Get('email/:email')
  @Public()
  @ApiOperation({ summary: 'Find author by email', description: 'Find an author by its email' })
  @ApiParam({ name: 'email', description: 'Author email' })
  @ApiResponse({ status: 200, description: 'Author found' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  findByEmail(@Param('email') email: string) {
    return this.authorsService.findByEmail(email);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Find all active authors', description: 'Find all active authors' })
  @ApiResponse({ status: 200, description: 'Authors found' })
  findAllActive() {
    return this.authorsService.findAllActive();
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Find all authors', description: 'Find all authors' })
  @ApiResponse({ status: 200, description: 'Authors found' })
  findAll() {
    return this.authorsService.findAll();
  }

  @Get('status/:status')
  @Public()
  @ApiOperation({ summary: 'Find authors by status', description: 'Find authors by their status' })
  @ApiParam({ name: 'status', enum: Status, description: 'Author status' })
  @ApiResponse({ status: 200, description: 'Authors found' })
  findByStatus(@Param('status') status: Status) {
    return this.authorsService.findByStatus(status);
  }

  @Put(':id')
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing author', description: 'Update an existing author with the provided data' })
  @ApiParam({ name: 'id', description: 'Author id (UUID)' })
  @ApiResponse({ status: 200, description: 'Author updated successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  @ApiResponse({ status: 409, description: 'Author already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAuthorDto,
  ) {
    return this.authorsService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update author status', description: 'Update the status of an author' })
  @ApiParam({ name: 'id', description: 'Author id (UUID)' })
  @ApiResponse({ status: 200, description: 'Author status updated successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.authorsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete author', description: 'Soft delete an author' })
  @ApiParam({ name: 'id', description: 'Author id (UUID)' })
  @ApiResponse({ status: 204, description: 'Author soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.authorsService.softDelete(id);
  }

  @Delete('hard/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Hard delete author', description: 'Hard delete an author' })
  @ApiParam({ name: 'id', description: 'Author id (UUID)' })
  @ApiResponse({ status: 204, description: 'Author hard deleted successfully' })
  @ApiResponse({ status: 404, description: 'Author not found' })
  hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.authorsService.hardDelete(id);
  }
}
