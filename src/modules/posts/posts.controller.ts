import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdateStatusDto } from '../../common/dto/update-status.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { Status } from '@prisma/client';

@ApiTags('Post')
@Controller('v1/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('last-post')
  @Public()
  @ApiOperation({ summary: 'Get last published post', description: 'Retrieves the most recently published post' })
  @ApiResponse({ status: 200, description: 'Last post of the blog' })
  @ApiResponse({ status: 404, description: 'No posts found' })
  async getLastPost() {
    const posts = await this.postsService.findLatestPosts(1);
    if (!posts || posts.length === 0) {
      return null;
    }
    return posts[0];
  }

  @Get('latest')
  @Public()
  @ApiOperation({
    summary: 'Get latest published posts',
    description: 'Retrieves a list of the most recently published posts, up to an optional limit.',
  })
  @ApiQuery({ name: 'limit', required: false, example: 5, description: 'Limit of posts to return' })
  @ApiResponse({ status: 200, description: 'Latest posts of the blog' })
  getLatestPosts(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.postsService.findLatestPosts(parsedLimit);
  }

  @Get('most-relevance')
  @Public()
  @ApiOperation({ summary: 'Find most relevant posts', description: 'Find the most relevant posts up to a given limit' })
  @ApiQuery({ name: 'limit', required: false, example: 5, description: 'Limit of posts to return' })
  @ApiResponse({ status: 200, description: 'Relevant posts found' })
  getMostRelevance(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.postsService.findMostRelevant(parsedLimit);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new post', description: 'Create a new post with the provided data' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 404, description: 'Category or Author not found' })
  @ApiResponse({ status: 409, description: 'Post slug already exists' })
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @Get('recommended-posts/:slug')
  @Public()
  @ApiOperation({
    summary: 'Get recommended posts by slug',
    description: 'Retrieves the detailed list of recommended posts associated with the post identified by the given slug.',
  })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  @ApiResponse({ status: 200, description: 'Post recommendations found' })
  getRecommendedPosts(@Param('slug') slug: string) {
    return this.postsService.findRecommendedPosts(slug);
  }

  @Get('next-posts/:slug')
  @Public()
  @ApiOperation({
    summary: 'Find next sequential posts',
    description: 'Find up to 6 unique posts related dynamically by category, chronology, and fallback rules',
  })
  @ApiParam({ name: 'slug', description: 'Current post slug' })
  @ApiResponse({ status: 200, description: 'Sequential posts found' })
  getNextPosts(@Param('slug') slug: string) {
    return this.postsService.findNextPosts(slug, 6);
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Find post by slug', description: 'Find a post by its slug' })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  @ApiResponse({ status: 200, description: 'Post found' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Find post by id', description: 'Find a post by its id' })
  @ApiParam({ name: 'id', description: 'Post id (UUID)' })
  @ApiResponse({ status: 200, description: 'Post found' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findById(id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Find all active posts', description: 'Find all active posts' })
  @ApiResponse({ status: 200, description: 'Posts found' })
  findAllActive() {
    return this.postsService.findAllActive();
  }

  @Get('all')
  @Public()
  @ApiOperation({ summary: 'Find all posts', description: 'Find all posts' })
  @ApiResponse({ status: 200, description: 'Posts found' })
  findAll() {
    return this.postsService.findAll();
  }

  @Get('status/:status')
  @Public()
  @ApiOperation({ summary: 'Find posts by status', description: 'Find posts by their status' })
  @ApiParam({ name: 'status', enum: Status, description: 'Post status' })
  @ApiResponse({ status: 200, description: 'Posts found' })
  findByStatus(@Param('status') status: Status) {
    return this.postsService.findAllByStatus(status);
  }

  @Put(':id')
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an existing post', description: 'Update an existing post with the provided data' })
  @ApiParam({ name: 'id', description: 'Post id (UUID)' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 404, description: 'Post, Category or Author not found' })
  @ApiResponse({ status: 409, description: 'Post slug already exists' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update post status', description: 'Update the status of a post' })
  @ApiParam({ name: 'id', description: 'Post id (UUID)' })
  @ApiResponse({ status: 200, description: 'Post status updated successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.postsService.updateStatus(id, dto.status);
  }

  @Patch(':id/views')
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Increment post views by ID', description: 'Increment the view counter of a post by 1' })
  @ApiParam({ name: 'id', description: 'Post id (UUID)' })
  @ApiResponse({ status: 204, description: 'Post view incremented successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  incrementViewsById(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.incrementViews(id);
  }

  @Patch('views/:slug')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment post views by slug (público)', description: 'Increment the view counter of a post by slug' })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  @ApiResponse({ status: 204, description: 'Post view incremented successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  incrementViewsBySlug(@Param('slug') slug: string) {
    return this.postsService.incrementViews(slug);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete post', description: 'Soft delete a post' })
  @ApiParam({ name: 'id', description: 'Post id (UUID)' })
  @ApiResponse({ status: 204, description: 'Post soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.softDelete(id);
  }

  @Delete('hard/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Hard delete post', description: 'Hard delete a post' })
  @ApiParam({ name: 'id', description: 'Post id (UUID)' })
  @ApiResponse({ status: 204, description: 'Post hard deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.hardDelete(id);
  }
}
