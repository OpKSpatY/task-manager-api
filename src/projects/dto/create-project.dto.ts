import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Nome do projeto',
    example: 'Projeto de Desenvolvimento Web',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descrição do projeto',
    example: 'Projeto para desenvolvimento de uma aplicação web moderna',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Se o projeto é visível para outros usuários',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isProjectVisible?: boolean;

  @ApiProperty({
    description: 'ID da organização à qual o projeto pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({
    description: 'Data limite para conclusão do projeto',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueTime?: string;

  @ApiProperty({
    description: 'ID do time atribuído ao projeto',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  teamAssignmentId?: string;

  @ApiProperty({
    description: 'ID do usuário que está criando o projeto',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
