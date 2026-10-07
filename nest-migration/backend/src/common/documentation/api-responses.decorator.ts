import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

/**
 * Standard documentation decorator for operations with validation and mutation.
 * Mirrors DefaultApiResponses.java from Spring Boot.
 */
export function DefaultApiResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Invalid request parameters or payload validation error',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  );
}

/**
 * Standard documentation decorator for read operations.
 * Mirrors DefaultReadApiResponses.java from Spring Boot.
 */
export function DefaultReadApiResponses() {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description: 'Resource not found',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  );
}
