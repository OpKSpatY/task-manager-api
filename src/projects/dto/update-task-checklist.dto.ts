import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateTaskChecklistDto {
  @ApiProperty({
    description: 'Nome da checklist',
    example: 'Checklist de Testes Atualizado',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}


