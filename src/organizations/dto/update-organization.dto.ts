import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiProperty({
    description: 'Nome da organização',
    example: 'Tech Corp Updated',
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Nome deve ser uma string' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'Descrição da organização (opcional)',
    example: 'Empresa focada em soluções de tecnologia inovadoras e atualizadas.',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  description?: string;
}
