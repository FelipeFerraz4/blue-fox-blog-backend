import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Unique identifier of the post the comment belongs to',
    example: '9f000001-28ab-4add-bbbb-112233445566',
  })
  @IsNotEmpty({ message: 'Post ID cannot be null or empty' })
  @IsUUID('all', { message: 'Post ID must be a valid UUID' })
  postId: string;

  @ApiProperty({
    description: 'Comment text content',
    example: 'Great article! It helped me a lot setting up my planted aquarium.',
  })
  @IsNotEmpty({ message: 'Comment content cannot be null or empty' })
  @IsString({ message: 'Content must be a string' })
  content: string;

  @ApiProperty({
    description: 'Name of the comment author',
    example: 'Carlos Silva',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Author name cannot be null or empty' })
  @IsString({ message: 'Author name must be a string' })
  @MaxLength(255, { message: 'Author name cannot exceed 255 characters' })
  authorName: string;
}
