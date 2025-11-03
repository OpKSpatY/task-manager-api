import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class CreateProjectSprintDto {
  @ApiProperty({
    description: 'Nome da sprint',
    example: 'Sprint 1 - Desenvolvimento Backend',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'ID do projeto ao qual a sprint pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: 'Data de início da sprint',
    example: '2024-01-01',
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  beginAt: string;

  @ApiProperty({
    description: 'Data de término da sprint',
    example: '2024-01-14',
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  dueAt: string;

  @ApiProperty({
    description: 'ID do usuário que está criando a sprint',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

