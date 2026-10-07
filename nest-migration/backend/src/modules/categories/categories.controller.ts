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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateStatusDto } from '../../common/dto/update-status.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { Status } from '@prisma/client';

@ApiTags('Category')
@Controller('v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new category', description: 'Create a new category with the provided data' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Category already exists' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Find category by id', description: 'Find a category by its id' })
  @ApiParam({ name: 'id', description: 'Category id (UUID)' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findById(id);
  }

  @Get('name/:name')
  @Public()
  @ApiOperation({ summary: 'Find category by name', description: 'Find a category by its name' })
  @ApiParam({ name: 'name', description: 'Category name' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findByName(@Param('name') name: string) {
    return this.categoriesService.findByName(name);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Find category by slug', description: 'Find a category by its slug' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Find all active categories', description: 'Find all active categories' })
  @ApiResponse({ status: 200, description: 'Categories found' })
  findAllActive() {
    return this.categoriesService.findAllActive();
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Find all categories', description: 'Find all categories' })
  @ApiResponse({ status: 200, description: 'Categories found' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('status/:status')
  @Public()
  @ApiOperation({ summary: 'Find categories by status', description: 'Find categories by their status' })
  @ApiParam({ name: 'status', enum: Status, description: 'Category status' })
  @ApiResponse({ status: 200, description: 'Categories found' })
  findByStatus(@Param('status') status: Status) {
    return this.categoriesService.findByStatus(status);
  }

  @Put(':id')
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing category', description: 'Update an existing category with the provided data' })
  @ApiParam({ name: 'id', description: 'Category id (UUID)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update category status', description: 'Update the status of a category' })
  @ApiParam({ name: 'id', description: 'Category id (UUID)' })
  @ApiResponse({ status: 200, description: 'Category status updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.categoriesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete category', description: 'Soft delete a category' })
  @ApiParam({ name: 'id', description: 'Category id (UUID)' })
  @ApiResponse({ status: 204, description: 'Category soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.softDelete(id);
  }

  @Delete('hard/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Hard delete category', description: 'Hard delete a category' })
  @ApiParam({ name: 'id', description: 'Category id (UUID)' })
  @ApiResponse({ status: 204, description: 'Category hard deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.hardDelete(id);
  }
}
