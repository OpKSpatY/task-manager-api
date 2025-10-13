import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '66118f12-f91b-437b-92c6-d3e493a918ca',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João',
  })
  firstName: string;

  @ApiProperty({
    description: 'Sobrenome do usuário',
    example: 'Silva',
  })
  lastName: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Data do último login',
    example: '2024-01-01T12:00:00.000Z',
    required: false,
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Data de criação da conta',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  fullName: string;
}

