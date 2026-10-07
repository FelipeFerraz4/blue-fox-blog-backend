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
  @ApiOperation({ summary: 'Obter dados do blog atual', description: 'Retorna as informações do blog definido no contexto de multi-tenant' })
  @ApiResponse({ status: 200, description: 'Blog encontrado' })
  @ApiResponse({ status: 404, description: 'Blog não encontrado' })
  getCurrentBlog() {
    return this.blogsService.getCurrentBlog();
  }

  @Get('slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Buscar blog por slug', description: 'Retorna as informações do blog com base no slug' })
  @ApiParam({ name: 'slug', description: 'Slug do blog' })
  @ApiResponse({ status: 200, description: 'Blog encontrado' })
  @ApiResponse({ status: 404, description: 'Blog não encontrado' })
  findBySlug(@Param('slug') slug: string) {
    return this.blogsService.findBySlug(slug);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar todos os blogs ativos', description: 'Retorna a lista de blogs com status ACTIVE' })
  @ApiResponse({ status: 200, description: 'Blogs encontrados' })
  findAllActive() {
    return this.blogsService.findAllActive();
  }
}
