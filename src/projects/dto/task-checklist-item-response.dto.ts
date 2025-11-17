import { ApiProperty } from '@nestjs/swagger';

export class TaskChecklistItemResponseDto {
  @ApiProperty({
    description: 'ID único do item da checklist',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Descrição do item da checklist',
    example: 'Verificar se o login está funcionando corretamente',
  })
  itemDescription: string;

  @ApiProperty({
    description: 'Se o item está completo',
    example: false,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'ID da checklist à qual o item pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  tasksChecklistId: string;

  @ApiProperty({
    description: 'Data de criação do item',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização do item',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}


