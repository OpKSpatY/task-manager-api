import { ApiProperty } from '@nestjs/swagger';

export class ProjectSprintResponseDto {
  @ApiProperty({
    description: 'ID único da sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da sprint',
    example: 'Sprint 1 - Desenvolvimento Backend',
  })
  name: string;

  @ApiProperty({
    description: 'ID do projeto ao qual a sprint pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Data de início da sprint',
    example: '2024-01-01',
    format: 'date',
  })
  beginAt: Date;

  @ApiProperty({
    description: 'Data de término da sprint',
    example: '2024-01-14',
    format: 'date',
  })
  dueAt: Date;

  @ApiProperty({
    description: 'Data de criação da sprint',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização da sprint',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Informações do projeto',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Projeto de Desenvolvimento Web',
      description: 'Projeto para desenvolvimento de uma aplicação web moderna',
    },
    required: false,
  })
  project?: {
    id: string;
    name: string;
    description?: string;
  };
}

