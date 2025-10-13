import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({
    description: 'Nome do time',
    example: 'Equipe de Desenvolvimento',
    minLength: 1,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Nome do time é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Descrição do time (opcional)',
    example: 'Time responsável pelo desenvolvimento de novas funcionalidades.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  description?: string;
}

