import { ApiProperty } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty({
    description: 'ID único do projeto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do projeto',
    example: 'Projeto de Desenvolvimento Web',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição do projeto',
    example: 'Projeto para desenvolvimento de uma aplicação web moderna',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: 'Se o projeto é visível para outros usuários',
    example: true,
  })
  isProjectVisible: boolean;

  @ApiProperty({
    description: 'ID da organização à qual o projeto pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  organizationId: string;

  @ApiProperty({
    description: 'Data limite para conclusão do projeto',
    example: '2024-12-31T23:59:59.000Z',
    nullable: true,
  })
  dueTime?: Date;

  @ApiProperty({
    description: 'ID do time atribuído ao projeto',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true,
  })
  teamAssignmentId?: string;

  @ApiProperty({
    description: 'Data de criação do projeto',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do projeto',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Informações da organização',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Minha Organização',
      description: 'Descrição da organização',
    },
  })
  organization?: {
    id: string;
    name: string;
    description?: string;
  };

  @ApiProperty({
    description: 'Informações do time atribuído',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Time de Desenvolvimento',
      description: 'Time responsável pelo desenvolvimento',
    },
  })
  teamAssignment?: {
    id: string;
    name: string;
    description?: string;
  };
}
