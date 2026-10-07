import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    enum: Status,
    description: 'New status for the target entity',
    example: Status.ACTIVE,
  })
  @IsNotEmpty({ message: 'Status cannot be null or empty' })
  @IsEnum(Status, { message: 'Status must be one of: ACTIVE, INACTIVE, SUSPENDED, PENDING, DELETED' })
  status: Status;
}
