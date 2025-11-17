import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTaskChecklistDto {
  @ApiProperty({
    description: 'Nome da checklist',
    example: 'Checklist de Testes',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'ID da tarefa à qual a checklist pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  projectTasksId: string;

  @ApiProperty({
    description: 'ID do usuário que está criando a checklist',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}


