import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty({
    description: 'ID único da organização',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da organização',
    example: 'OpenAI Team',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição da organização',
    example: 'Equipe de pesquisa e desenvolvimento de IA',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'ID do usuário criador da organização',
    example: '7b8a4d2f-5b6c-4c8a-9b0f-1a2b3c4d5e6f',
  })
  organizationCreator: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-09-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2025-09-15T12:45:00.000Z',
  })
  updatedAt: Date;
}
