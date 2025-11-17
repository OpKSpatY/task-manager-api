import { ApiProperty } from '@nestjs/swagger';

export class TaskChecklistResponseDto {
  @ApiProperty({
    description: 'ID único da checklist',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da checklist',
    example: 'Checklist de Testes',
  })
  name: string;

  @ApiProperty({
    description: 'ID da tarefa à qual a checklist pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectTasksId: string;

  @ApiProperty({
    description: 'Data de criação da checklist',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização da checklist',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}


