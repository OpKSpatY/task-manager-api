import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Nome da organização',
    example: 'Tech Corp',
    minLength: 1,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Nome da organização é obrigatório' })
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Descrição da organização (opcional)',
    example: 'Empresa focada em soluções de tecnologia inovadoras.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  description?: string;
}
