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
  @ApiOperation({ summary: 'Create a new comment on a post', description: 'Allows readers to add comments on an existing post' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  create(@Body() dto: CreateCommentDto) {
    return this.commentsService.create(dto);
  }

  @Get('post/:postId')
  @Public()
  @ApiOperation({ summary: 'List comments of a post', description: 'Returns all active comments belonging to a specific post' })
  @ApiParam({ name: 'postId', description: 'Post id (UUID)' })
  @ApiResponse({ status: 200, description: 'Comments found' })
  findByPost(@Param('postId', ParseUUIDPipe) postId: string) {
    return this.commentsService.findByPost(postId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'AQUARISM_EDITORS')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update comment status (Moderation)', description: 'Moderates comment status (ACTIVE, INACTIVE, etc.)' })
  @ApiParam({ name: 'id', description: 'Comment id (UUID)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
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
  @ApiOperation({ summary: 'Soft delete comment', description: 'Marks comment status as DELETED' })
  @ApiParam({ name: 'id', description: 'Comment id (UUID)' })
  @ApiResponse({ status: 204, description: 'Comment soft deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.softDelete(id);
  }

  @Delete('hard/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Hard delete comment', description: 'Permanently removes comment from the database' })
  @ApiParam({ name: 'id', description: 'Comment id (UUID)' })
  @ApiResponse({ status: 204, description: 'Comment hard deleted successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  hardDelete(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.hardDelete(id);
  }
}
