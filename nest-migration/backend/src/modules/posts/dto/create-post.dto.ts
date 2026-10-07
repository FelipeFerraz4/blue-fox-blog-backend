import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    description: 'Title of the blog post',
    example: 'Como montar seu primeiro aquário plantado',
    minLength: 5,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Post title cannot be null or empty' })
  @IsString({ message: 'Title must be a string' })
  @MinLength(5, { message: 'Post title must be between 5 and 255 characters' })
  @MaxLength(255, { message: 'Post title must be between 5 and 255 characters' })
  title: string;

  @ApiProperty({
    description: 'Short description or summary of the post for SEO and cards',
    example: 'Um guia passo a passo completo para iniciantes no aquarismo plantado...',
    maxLength: 160,
  })
  @IsNotEmpty({ message: 'Post description cannot be null or empty' })
  @IsString({ message: 'Description must be a string' })
  @MaxLength(160, { message: 'Post description cannot exceed 160 characters' })
  description: string;

  @ApiPropertyOptional({
    description: "URL of the post's cover image",
    example: 'assets/images/aquariums/aquarium2.webp',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  @MaxLength(255, { message: 'Image URL cannot exceed 255 characters' })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Unique, SEO-friendly slug for the post URL (auto-gerado a partir do título se omitido)',
    example: 'como-montar-seu-primeiro-aquario-plantado',
    minLength: 3,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  @MinLength(3, { message: 'Post slug must be between 3 and 255 characters' })
  @MaxLength(255, { message: 'Post slug must be between 3 and 255 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Post slug must contain only lowercase letters, numbers and single hyphens between words',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: "Estimated reading time (e.g., '5 min')",
    example: '8 min',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Reading time must be a string' })
  @MaxLength(50, { message: 'Reading time cannot exceed 50 characters' })
  readingTime?: string;

  @ApiProperty({
    description: 'Publishing status of the post',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'Published must be a boolean' })
  published: boolean;

  @ApiProperty({
    description: 'The unique identifier of the category this post belongs to',
    example: 'c1111111-28ab-4add-aaaa-112233445566',
  })
  @IsNotEmpty({ message: 'Category ID cannot be null' })
  @IsUUID('all', { message: 'Category ID must be a valid UUID' })
  categoryId: string;

  @ApiProperty({
    description: 'The unique identifier of the author who wrote the post',
    example: '1a3e5b7c-28ab-4add-9999-112233445566',
  })
  @IsNotEmpty({ message: 'Author ID cannot be null' })
  @IsUUID('all', { message: 'Author ID must be a valid UUID' })
  authorId: string;

  @ApiPropertyOptional({
    description: 'The list of unique identifiers of recommended posts',
    example: ['9f000002-28ab-4add-bbbb-112233445566', '9f000003-28ab-4add-bbbb-112233445566'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Recommended post IDs must be an array' })
  @IsUUID('all', { each: true, message: 'Each recommended post ID must be a valid UUID' })
  recommendedPostIds?: string[];
}
