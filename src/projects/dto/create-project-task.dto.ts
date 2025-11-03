import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '../project-task.model';

export class CreateProjectTaskDto {
  @ApiProperty({
    description: 'Nome da tarefa',
    example: 'Implementar autenticação de usuários',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descrição da tarefa',
    example: 'Implementar sistema completo de autenticação com JWT',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Data de vencimento da tarefa',
    example: '2024-01-10',
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({
    description: 'Status da tarefa',
    example: 'not_started',
    enum: TaskStatus,
    default: 'not_started',
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({
    description: 'ID da sprint à qual a tarefa pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  projectSprintId: string;

  @ApiProperty({
    description: 'ID da tarefa da qual esta tarefa depende (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  taskDependsOn?: string;

  @ApiProperty({
    description: 'ID do usuário que está criando a tarefa',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

