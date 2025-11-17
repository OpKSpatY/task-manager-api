import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateTaskChecklistItemDto {
  @ApiProperty({
    description: 'Descrição do item da checklist',
    example: 'Verificar se o login está funcionando corretamente - Atualizado',
    required: false,
  })
  @IsOptional()
  @IsString()
  itemDescription?: string;

  @ApiProperty({
    description: 'Se o item está completo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}


