import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Timestamp when the error occurred',
    example: '2026-10-07T12:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 404,
  })
  status: number;

  @ApiProperty({
    description: 'HTTP status reason',
    example: 'Not Found',
  })
  error: string;

  @ApiProperty({
    description: 'Detailed error message',
    example: 'Category not found with id: 123e4567-e89b-12d3-a456-426614174000',
  })
  message: string;

  @ApiProperty({
    description: 'Request path that generated the error',
    example: '/api/v1/categories/123e4567-e89b-12d3-a456-426614174000',
  })
  path: string;

  @ApiPropertyOptional({
    description: 'Additional validation error details when applicable',
    example: { name: 'Post title cannot be null or empty' },
  })
  details?: Record<string, string> | any;
}
