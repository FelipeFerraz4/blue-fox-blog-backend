import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { BlogsService } from './blogs.service';
import { Public } from '../auth/public.decorator';

@ApiTags('Blog')
@Controller('v1/blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get('current')
  @Public()
  @ApiOperation({ summary: 'Get current tenant blog metadata', description: 'Returns blog information resolved from the active multi-tenant context' })
  @ApiResponse({ status: 200, description: 'Blog found' })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  getCurrentBlog() {
    return this.blogsService.getCurrentBlog();
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Find blog by slug', description: 'Returns blog information matching the given slug' })
  @ApiParam({ name: 'slug', description: 'Blog slug' })
  @ApiResponse({ status: 200, description: 'Blog found' })
  @ApiResponse({ status: 404, description: 'Blog not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.blogsService.findBySlug(slug);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all active blogs', description: 'Returns a list of all blogs currently in ACTIVE status' })
  @ApiResponse({ status: 200, description: 'Blogs found' })
  findAllActive() {
    return this.blogsService.findAllActive();
  }
}
