import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class UpdateProjectSprintDto {
  @ApiProperty({
    description: 'Nome da sprint',
    example: 'Sprint 1 - Desenvolvimento Backend Atualizado',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Data de início da sprint',
    example: '2024-01-01',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  beginAt?: string;

  @ApiProperty({
    description: 'Data de término da sprint',
    example: '2024-01-14',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueAt?: string;
}

