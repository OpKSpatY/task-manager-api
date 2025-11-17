import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateTaskChecklistItemDto {
  @ApiProperty({
    description: 'Descrição do item da checklist',
    example: 'Verificar se o login está funcionando corretamente',
  })
  @IsString()
  @IsNotEmpty()
  itemDescription: string;

  @ApiProperty({
    description: 'Se o item está completo',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({
    description: 'ID da checklist à qual o item pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  tasksChecklistId: string;

  @ApiProperty({
    description: 'ID do usuário que está criando o item',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}


