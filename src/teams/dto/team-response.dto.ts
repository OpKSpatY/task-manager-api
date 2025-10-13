import { ApiProperty } from '@nestjs/swagger';

export class TeamResponseDto {
  @ApiProperty({
    description: 'ID único do time',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do time',
    example: 'Equipe de Desenvolvimento',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição do time',
    example: 'Time responsável pelo desenvolvimento de novas funcionalidades.',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'ID do usuário proprietário do time',
    example: '7b8a4d2f-5b6c-4c8a-9b0f-1a2b3c4d5e6f',
  })
  userOwnerId: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-09-29T13:45:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2025-09-29T15:30:00.000Z',
  })
  updatedAt: Date;
}

export class TeamWithUsersResponseDto extends TeamResponseDto {
  @ApiProperty({
    description: 'Lista de usuários do time',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'team-user-id' },
        name: { type: 'string', example: 'João Silva' },
        userId: { type: 'string', example: 'user-id' },
        teamId: { type: 'string', example: 'team-id' },
        createdAt: { type: 'string', example: '2025-09-29T13:45:00.000Z' },
        updatedAt: { type: 'string', example: '2025-09-29T13:45:00.000Z' },
      },
    },
  })
  teamUsers: any[];
}

