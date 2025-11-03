import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDateString, IsInt, IsEnum, Min } from 'class-validator';
import { TaskStatus } from '../project-task.model';

export class UpdateProjectTaskDto {
  @ApiProperty({
    description: 'Nome da tarefa',
    example: 'Implementar autenticação de usuários atualizado',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Descrição da tarefa',
    example: 'Implementar sistema completo de autenticação com JWT atualizado',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Posição da tarefa na sprint',
    example: 2,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiProperty({
    description: 'Data de vencimento da tarefa',
    example: '2024-01-12',
    format: 'date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'Status da tarefa',
    example: 'in_progress',
    enum: TaskStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'ID da tarefa da qual esta tarefa depende (opcional, pode ser null para remover dependência)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  taskDependsOn?: string | null;
}

