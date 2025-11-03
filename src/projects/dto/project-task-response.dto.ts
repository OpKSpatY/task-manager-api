import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../project-task.model';

export class ProjectTaskResponseDto {
  @ApiProperty({
    description: 'ID único da tarefa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da tarefa',
    example: 'Implementar autenticação de usuários',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição da tarefa',
    example: 'Implementar sistema completo de autenticação com JWT',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    description: 'Posição da tarefa na sprint',
    example: 1,
  })
  position: number;

  @ApiProperty({
    description: 'Data de vencimento da tarefa',
    example: '2024-01-10',
    format: 'date',
  })
  dueDate: Date;

  @ApiProperty({
    description: 'Status da tarefa',
    example: 'not_started',
    enum: TaskStatus,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'ID da sprint à qual a tarefa pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectSprintId: string;

  @ApiProperty({
    description: 'ID da tarefa da qual esta tarefa depende',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true,
  })
  taskDependsOn?: string;

  @ApiProperty({
    description: 'Data de criação da tarefa',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização da tarefa',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Informações da sprint',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Sprint 1 - Desenvolvimento Backend',
      beginAt: '2024-01-01',
      dueAt: '2024-01-14',
    },
    required: false,
  })
  projectSprint?: {
    id: string;
    name: string;
    beginAt: Date;
    dueAt: Date;
  };
}

