import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({
    enum: Status,
    description: 'Novo status para a entidade',
    example: Status.ACTIVE,
  })
  @IsNotEmpty({ message: 'O status é obrigatório.' })
  @IsEnum(Status, { message: 'Status deve ser ACTIVE, INACTIVE, SUSPENDED, PENDING ou DELETED.' })
  status: Status;
}
