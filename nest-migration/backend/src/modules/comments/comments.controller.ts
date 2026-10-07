import {
  Controller,
  Get,
  Post,
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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateStatusDto } from '../../common/dto/update-status.dto';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Comment')
@Controller('v1/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo comentário em um post', description: 'Permite que leitores adicionem comentários em um post' })
  @ApiResponse({ status: 201, description: 'Comentário criado com sucesso' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  create(@Body() dto: CreateCommentDto) {
    return this.commentsService.create(dto);
  }

  @Get('post/:postId')
  @Public()
  @ApiOperation({ summary: 'Listar comentários de um post', description: 'Retorna todos os comentários ativos de um determinado post' })
  @ApiParam({ name: 'postId', description: 'ID do post (UUID)' })
  @ApiResponse({ status: 200, description: 'Comentários encontrados' })
  findByPost(@Param('postId', ParseUUIDPipe) postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar status do comentário (Moderação)', description: 'Moderar status do comentário (ACTIVE, INACTIVE, etc.)' })
  @ApiParam({ name: 'id', description: 'ID do comentário (UUID)' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.commentsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft delete comentário', description: 'Marca status do comentário como DELETED' })
  @ApiParam({ name: 'id', description: 'ID do comentário (UUID)' })
  @ApiResponse({ status: 204, description: 'Comentário excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.softDelete(id);
  }

  @Delete('hard/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Hard delete comentário', description: 'Remove fisicamente o comentário do banco' })
  @ApiParam({ name: 'id', description: 'ID do comentário (UUID)' })
  @ApiResponse({ status: 204, description: 'Comentário excluído permanentemente' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.hardDelete(id);
  }
}
