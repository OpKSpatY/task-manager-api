import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';
import { ProjectTask, TaskStatus } from './project-task.model';
import { ProjectSprint } from './project-sprint.model';
import { Project } from './project.model';
import { Organization } from '../organizations/organizations.model';
import { OrganizationUser } from '../organizations/organization-user.model';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';
import { ProjectTaskResponseDto } from './dto/project-task-response.dto';

@Injectable()
export class ProjectTasksService {
  constructor(
    @InjectModel(ProjectTask)
    private readonly projectTaskModel: typeof ProjectTask,
    @InjectModel(ProjectSprint)
    private readonly projectSprintModel: typeof ProjectSprint,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(Organization)
    private readonly organizationModel: typeof Organization,
    @InjectModel(OrganizationUser)
    private readonly organizationUserModel: typeof OrganizationUser,
  ) {}

  async create(
    createProjectTaskDto: CreateProjectTaskDto,
    userId: string,
  ): Promise<ProjectTaskResponseDto> {
    try {
      // Verificar se a sprint existe e obter informações do projeto
      const sprintResult = await this.organizationUserModel.sequelize?.query(
        `SELECT ps.*, 
                p.organization_id,
                o.organization_creator
         FROM project_sprints ps
         JOIN projects p ON ps.project_id = p.id
         JOIN organizations o ON p.organization_id = o.id
         WHERE ps.id = :sprintId`,
        {
          replacements: { sprintId: createProjectTaskDto.projectSprintId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!sprintResult || sprintResult.length === 0) {
        throw new NotFoundException('Sprint não encontrada');
      }

      const sprint = sprintResult[0];

      // Verificar se o usuário tem permissão para criar tarefas no projeto
      await this.checkUserProjectPermission(userId, sprint.organization_id);

      // Validar que a data de vencimento está dentro do intervalo da sprint
      const dueDate = new Date(createProjectTaskDto.dueDate);
      const sprintBeginAt = new Date(sprint.begin_at);
      const sprintDueAt = new Date(sprint.due_at);

      // Normalizar datas para comparação (apenas data, sem hora)
      const dueDateNormalized = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
      const sprintBeginAtNormalized = new Date(sprintBeginAt.getFullYear(), sprintBeginAt.getMonth(), sprintBeginAt.getDate());
      const sprintDueAtNormalized = new Date(sprintDueAt.getFullYear(), sprintDueAt.getMonth(), sprintDueAt.getDate());

      if (dueDateNormalized < sprintBeginAtNormalized || dueDateNormalized > sprintDueAtNormalized) {
        throw new BadRequestException(
          `A data de vencimento da tarefa deve estar dentro do intervalo da sprint (${sprint.begin_at} a ${sprint.due_at})`
        );
      }

      // Calcular a próxima posição automaticamente
      const maxPositionResult = await this.organizationUserModel.sequelize?.query(
        `SELECT COALESCE(MAX(position), -1) as max_position
         FROM project_tasks
         WHERE project_sprint_id = :sprintId`,
        {
          replacements: { sprintId: createProjectTaskDto.projectSprintId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      // Se não há tarefas (max_position é NULL), começa em 0. Caso contrário, incrementa +1
      const maxPosition = maxPositionResult && maxPositionResult.length > 0 
        ? maxPositionResult[0].max_position 
        : -1;
      
      const nextPosition = maxPosition === -1 ? 0 : maxPosition + 1;

      // Validar se a tarefa dependente existe (se fornecida)
      if (createProjectTaskDto.taskDependsOn) {
        const dependsOnTaskResult = await this.organizationUserModel.sequelize?.query(
          'SELECT id FROM project_tasks WHERE id = :taskId',
          {
            replacements: { taskId: createProjectTaskDto.taskDependsOn },
            type: QueryTypes.SELECT,
          }
        ) as any[];

        if (!dependsOnTaskResult || dependsOnTaskResult.length === 0) {
          throw new NotFoundException('Tarefa dependente não encontrada');
        }

        // Nota: Não podemos verificar dependência de si mesma na criação porque a tarefa ainda não existe
        // Mas podemos fazer isso no update se necessário
      }

      // Criar tarefa
      const taskData: any = {
        name: createProjectTaskDto.name,
        description: createProjectTaskDto.description,
        position: nextPosition,
        dueDate: dueDate,
        status: createProjectTaskDto.status || TaskStatus.NOT_STARTED,
        projectSprintId: createProjectTaskDto.projectSprintId,
        taskDependsOn: createProjectTaskDto.taskDependsOn || null,
      };

      const task = await this.projectTaskModel.create(taskData);

      return this.formatTaskResponse(task);
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException ||
          error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async findAll(sprintId: string, userId: string): Promise<ProjectTaskResponseDto[]> {
    try {
      // Verificar se a sprint existe e se o usuário tem acesso
      const sprintResult = await this.organizationUserModel.sequelize?.query(
        `SELECT ps.*, 
                p.organization_id,
                o.organization_creator
         FROM project_sprints ps
         JOIN projects p ON ps.project_id = p.id
         JOIN organizations o ON p.organization_id = o.id
         WHERE ps.id = :sprintId`,
        {
          replacements: { sprintId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!sprintResult || sprintResult.length === 0) {
        throw new NotFoundException('Sprint não encontrada');
      }

      const sprint = sprintResult[0];

      // Verificar se o usuário tem acesso ao projeto
      await this.checkUserProjectPermission(userId, sprint.organization_id);

      // Buscar tarefas usando SQL raw
      const tasksResult = await this.organizationUserModel.sequelize?.query(
        `SELECT pt.*, 
                ps.name as sprint_name, ps.begin_at as sprint_begin_at, ps.due_at as sprint_due_at
         FROM project_tasks pt
         LEFT JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         WHERE pt.project_sprint_id = :sprintId
         ORDER BY pt.position ASC, pt.created_at DESC`,
        {
          replacements: { sprintId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      // Converter para o formato esperado
      const tasks = tasksResult?.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description,
        position: task.position,
        dueDate: task.due_date,
        status: task.status,
        projectSprintId: task.project_sprint_id,
        taskDependsOn: task.task_depends_on || undefined,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        projectSprint: {
          id: task.project_sprint_id,
          name: task.sprint_name,
          beginAt: task.sprint_begin_at,
          dueAt: task.sprint_due_at,
        },
      })) || [];

      return tasks;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async findOne(id: string, userId: string): Promise<ProjectTaskResponseDto> {
    try {
      // Buscar tarefa usando SQL raw
      const taskResult = await this.organizationUserModel.sequelize?.query(
        `SELECT pt.*, 
                ps.name as sprint_name, ps.begin_at as sprint_begin_at, ps.due_at as sprint_due_at,
                p.organization_id
         FROM project_tasks pt
         LEFT JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         LEFT JOIN projects p ON ps.project_id = p.id
         WHERE pt.id = :taskId`,
        {
          replacements: { taskId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!taskResult || taskResult.length === 0) {
        throw new NotFoundException('Tarefa não encontrada');
      }

      const task = taskResult[0];

      if (!task.organization_id) {
        throw new NotFoundException('Sprint ou projeto não encontrado');
      }

      // Verificar se o usuário tem acesso ao projeto
      await this.checkUserProjectPermission(userId, task.organization_id);

      // Converter para o formato esperado
      return {
        id: task.id,
        name: task.name,
        description: task.description,
        position: task.position,
        dueDate: task.due_date,
        status: task.status,
        projectSprintId: task.project_sprint_id,
        taskDependsOn: task.task_depends_on || undefined,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        projectSprint: {
          id: task.project_sprint_id,
          name: task.sprint_name,
          beginAt: task.sprint_begin_at,
          dueAt: task.sprint_due_at,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async update(
    id: string,
    updateProjectTaskDto: UpdateProjectTaskDto,
    userId: string,
  ): Promise<ProjectTaskResponseDto> {
    try {
      // Buscar tarefa usando SQL raw para obter informações da sprint
      const taskResult = await this.organizationUserModel.sequelize?.query(
        `SELECT pt.*, 
                ps.begin_at as sprint_begin_at, ps.due_at as sprint_due_at,
                p.organization_id
         FROM project_tasks pt
         LEFT JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         LEFT JOIN projects p ON ps.project_id = p.id
         WHERE pt.id = :taskId`,
        {
          replacements: { taskId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!taskResult || taskResult.length === 0) {
        throw new NotFoundException('Tarefa não encontrada');
      }

      const task = taskResult[0];

      if (!task.organization_id) {
        throw new NotFoundException('Sprint ou projeto não encontrado');
      }

      // Verificar se o usuário tem permissão para editar a tarefa
      await this.checkUserProjectPermission(userId, task.organization_id);

      // Calcular a data de vencimento final (do DTO ou da tarefa existente)
      const finalDueDate = updateProjectTaskDto.dueDate
        ? new Date(updateProjectTaskDto.dueDate)
        : new Date(task.due_date);

      // Validar que a data de vencimento está dentro do intervalo da sprint (se foi alterada)
      if (updateProjectTaskDto.dueDate) {
        const sprintBeginAt = new Date(task.sprint_begin_at);
        const sprintDueAt = new Date(task.sprint_due_at);

        // Normalizar datas para comparação (apenas data, sem hora)
        const dueDateNormalized = new Date(finalDueDate.getFullYear(), finalDueDate.getMonth(), finalDueDate.getDate());
        const sprintBeginAtNormalized = new Date(sprintBeginAt.getFullYear(), sprintBeginAt.getMonth(), sprintBeginAt.getDate());
        const sprintDueAtNormalized = new Date(sprintDueAt.getFullYear(), sprintDueAt.getMonth(), sprintDueAt.getDate());

        if (dueDateNormalized < sprintBeginAtNormalized || dueDateNormalized > sprintDueAtNormalized) {
          throw new BadRequestException(
            `A data de vencimento da tarefa deve estar dentro do intervalo da sprint (${task.sprint_begin_at} a ${task.sprint_due_at})`
          );
        }
      }

      // Validar se a tarefa dependente existe (se fornecida)
      if (updateProjectTaskDto.taskDependsOn !== undefined) {
        if (updateProjectTaskDto.taskDependsOn) {
          // Verificar se a tarefa dependente existe
          const dependsOnTaskResult = await this.organizationUserModel.sequelize?.query(
            'SELECT id FROM project_tasks WHERE id = :taskId',
            {
              replacements: { taskId: updateProjectTaskDto.taskDependsOn },
              type: QueryTypes.SELECT,
            }
          ) as any[];

          if (!dependsOnTaskResult || dependsOnTaskResult.length === 0) {
            throw new NotFoundException('Tarefa dependente não encontrada');
          }

          // Verificar se não está tentando depender de si mesma
          if (updateProjectTaskDto.taskDependsOn === id) {
            throw new BadRequestException('Uma tarefa não pode depender de si mesma');
          }
        }
      }

      // Preparar dados para atualização
      const updateData: any = {};
      if (updateProjectTaskDto.name !== undefined) updateData.name = updateProjectTaskDto.name;
      if (updateProjectTaskDto.description !== undefined) updateData.description = updateProjectTaskDto.description;
      if (updateProjectTaskDto.position !== undefined) updateData.position = updateProjectTaskDto.position;
      if (updateProjectTaskDto.dueDate !== undefined) updateData.due_date = finalDueDate;
      if (updateProjectTaskDto.status !== undefined) updateData.status = updateProjectTaskDto.status;
      if (updateProjectTaskDto.taskDependsOn !== undefined) {
        updateData.task_depends_on = updateProjectTaskDto.taskDependsOn || null;
      }

      // Atualizar tarefa usando SQL raw
      const setClause = Object.keys(updateData).map(key => `${key} = :${key}`).join(', ');
      const replacements: any = { taskId: id };
      Object.keys(updateData).forEach(key => {
        replacements[key] = updateData[key];
      });

      await this.organizationUserModel.sequelize?.query(
        `UPDATE project_tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = :taskId`,
        {
          replacements,
          type: QueryTypes.UPDATE,
        }
      );

      // Buscar tarefa atualizada com relacionamentos usando SQL raw
      const updatedTaskResult = await this.organizationUserModel.sequelize?.query(
        `SELECT pt.*, 
                ps.name as sprint_name, ps.begin_at as sprint_begin_at, ps.due_at as sprint_due_at
         FROM project_tasks pt
         LEFT JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         WHERE pt.id = :taskId`,
        {
          replacements: { taskId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      const updatedTask = updatedTaskResult![0];

      // Converter para o formato esperado
      return {
        id: updatedTask.id,
        name: updatedTask.name,
        description: updatedTask.description,
        position: updatedTask.position,
        dueDate: updatedTask.due_date,
        status: updatedTask.status,
        projectSprintId: updatedTask.project_sprint_id,
        taskDependsOn: updatedTask.task_depends_on || undefined,
        createdAt: updatedTask.created_at,
        updatedAt: updatedTask.updated_at,
        projectSprint: {
          id: updatedTask.project_sprint_id,
          name: updatedTask.sprint_name,
          beginAt: updatedTask.sprint_begin_at,
          dueAt: updatedTask.sprint_due_at,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException ||
          error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      // Buscar tarefa usando SQL raw para obter informações do projeto
      const taskResult = await this.organizationUserModel.sequelize?.query(
        `SELECT pt.*, 
                p.organization_id
         FROM project_tasks pt
         LEFT JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         LEFT JOIN projects p ON ps.project_id = p.id
         WHERE pt.id = :taskId`,
        {
          replacements: { taskId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!taskResult || taskResult.length === 0) {
        throw new NotFoundException('Tarefa não encontrada');
      }

      const task = taskResult[0];

      if (!task.organization_id) {
        throw new NotFoundException('Sprint ou projeto não encontrado');
      }

      // Verificar se o usuário tem permissão para excluir a tarefa
      await this.checkUserProjectPermission(userId, task.organization_id);

      // Excluir a tarefa usando SQL raw
      await this.organizationUserModel.sequelize?.query(
        'DELETE FROM project_tasks WHERE id = :taskId',
        {
          replacements: { taskId: id },
          type: QueryTypes.DELETE,
        }
      );
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  private async checkUserProjectPermission(userId: string, organizationId: string): Promise<void> {
    // Primeiro, verificar se o usuário existe
    const userResult = await this.organizationUserModel.sequelize?.query(
      'SELECT id, first_name, last_name, email FROM users WHERE id = :userId',
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    if (!userResult || userResult.length === 0) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se a organização existe
    const organizationResult = await this.organizationUserModel.sequelize?.query(
      'SELECT id, name, description, organization_creator FROM organizations WHERE id = :organizationId',
      {
        replacements: { organizationId },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    if (!organizationResult || organizationResult.length === 0) {
      throw new NotFoundException('Organização não encontrada');
    }

    const organization = organizationResult[0];

    // Verificar se o usuário é o criador da organização
    if (organization.organization_creator === userId) {
      return; // Usuário é o criador da organização
    }

    // Verificar se o usuário tem acesso à organização
    const organizationUserResult = await this.organizationUserModel.sequelize?.query(
      'SELECT * FROM organization_users WHERE user_id = :userId AND organization_id = :organizationId',
      {
        replacements: { userId, organizationId },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    if (!organizationUserResult || organizationUserResult.length === 0) {
      throw new ForbiddenException('Você não tem acesso a esta organização');
    }

    const organizationUser = organizationUserResult[0];

    // Verificar se o usuário é administrador da organização
    if (organizationUser.user_organization_permission === 'ADMIN') {
      return; // Usuário é administrador
    }

    // Verificar se o usuário tem permissão específica para criar projetos
    if (organizationUser.user_can_create_projects) {
      return; // Usuário tem permissão para criar projetos
    }

    throw new ForbiddenException('Você não tem permissão para realizar esta ação nesta organização');
  }

  private formatTaskResponse(task: ProjectTask): ProjectTaskResponseDto {
    return {
      id: task.id,
      name: task.name,
      description: task.description,
      position: task.position,
      dueDate: task.dueDate,
      status: task.status,
      projectSprintId: task.projectSprintId,
      taskDependsOn: task.taskDependsOn || undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      projectSprint: task.projectSprint ? {
        id: task.projectSprint.id,
        name: task.projectSprint.name,
        beginAt: task.projectSprint.beginAt,
        dueAt: task.projectSprint.dueAt,
      } : undefined,
    };
  }
}

