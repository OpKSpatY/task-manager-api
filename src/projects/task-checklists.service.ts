import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';
import { TaskChecklist } from './task-checklist.model';
import { ProjectTask } from './project-task.model';
import { Organization } from '../organizations/organizations.model';
import { OrganizationUser } from '../organizations/organization-user.model';
import { CreateTaskChecklistDto } from './dto/create-task-checklist.dto';
import { UpdateTaskChecklistDto } from './dto/update-task-checklist.dto';
import { TaskChecklistResponseDto } from './dto/task-checklist-response.dto';

@Injectable()
export class TaskChecklistsService {
  constructor(
    @InjectModel(TaskChecklist)
    private readonly taskChecklistModel: typeof TaskChecklist,
    @InjectModel(ProjectTask)
    private readonly projectTaskModel: typeof ProjectTask,
    @InjectModel(Organization)
    private readonly organizationModel: typeof Organization,
    @InjectModel(OrganizationUser)
    private readonly organizationUserModel: typeof OrganizationUser,
  ) {}

  async create(
    createTaskChecklistDto: CreateTaskChecklistDto,
    userId: string,
  ): Promise<TaskChecklistResponseDto> {
    try {
      // Primeiro, verificar se a tarefa existe
      const taskExistsResult = await this.organizationUserModel.sequelize?.query(
        `SELECT id FROM project_tasks WHERE id = :taskId`,
        {
          replacements: { taskId: createTaskChecklistDto.projectTasksId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!taskExistsResult || taskExistsResult.length === 0) {
        throw new NotFoundException('Tarefa não encontrada');
      }

      // Buscar informações completas da tarefa com relacionamentos
      const taskResult = await this.organizationUserModel.sequelize?.query(
        `SELECT pt.*, 
                ps.project_id,
                p.organization_id,
                o.organization_creator
         FROM project_tasks pt
         LEFT JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         LEFT JOIN projects p ON ps.project_id = p.id
         LEFT JOIN organizations o ON p.organization_id = o.id
         WHERE pt.id = :taskId`,
        {
          replacements: { taskId: createTaskChecklistDto.projectTasksId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!taskResult || taskResult.length === 0 || !taskResult[0].organization_id) {
        throw new NotFoundException('Tarefa não encontrada ou sem organização associada');
      }

      const task = taskResult[0];

      // Verificar se o usuário tem permissão para criar checklists na tarefa
      await this.checkUserProjectPermission(userId, task.organization_id);

      // Criar checklist
      const checklistData: any = {
        name: createTaskChecklistDto.name,
        projectTasksId: createTaskChecklistDto.projectTasksId,
      };

      const checklist = await this.taskChecklistModel.create(checklistData);

      return this.formatChecklistResponse(checklist);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async findAll(taskId: string, userId: string): Promise<TaskChecklistResponseDto[]> {
    try {
      // Primeiro, verificar se a tarefa existe
      const taskExistsResult = await this.organizationUserModel.sequelize?.query(
        `SELECT id FROM project_tasks WHERE id = :taskId`,
        {
          replacements: { taskId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!taskExistsResult || taskExistsResult.length === 0) {
        throw new NotFoundException('Tarefa não encontrada');
      }

      // Buscar informações completas da tarefa com relacionamentos
      const taskResult = await this.organizationUserModel.sequelize?.query(
        `SELECT pt.*, 
                ps.project_id,
                p.organization_id,
                o.organization_creator
         FROM project_tasks pt
         LEFT JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         LEFT JOIN projects p ON ps.project_id = p.id
         LEFT JOIN organizations o ON p.organization_id = o.id
         WHERE pt.id = :taskId`,
        {
          replacements: { taskId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!taskResult || taskResult.length === 0 || !taskResult[0].organization_id) {
        throw new NotFoundException('Tarefa não encontrada ou sem organização associada');
      }

      const task = taskResult[0];

      // Verificar se o usuário tem acesso à tarefa
      await this.checkUserProjectPermission(userId, task.organization_id);

      // Buscar checklists usando SQL raw
      const checklistsResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tc.*
         FROM tasks_checklist tc
         WHERE tc.project_tasks_id = :taskId
         ORDER BY tc.created_at DESC`,
        {
          replacements: { taskId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      // Converter para o formato esperado
      const checklists = checklistsResult?.map(checklist => ({
        id: checklist.id,
        name: checklist.name,
        projectTasksId: checklist.project_tasks_id,
        createdAt: checklist.created_at,
        updatedAt: checklist.updated_at,
      })) || [];

      return checklists;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async findOne(id: string, userId: string): Promise<TaskChecklistResponseDto> {
    try {
      // Buscar checklist usando SQL raw
      const checklistResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tc.*, 
                pt.id as task_id,
                ps.project_id,
                p.organization_id
         FROM tasks_checklist tc
         JOIN project_tasks pt ON tc.project_tasks_id = pt.id
         JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         JOIN projects p ON ps.project_id = p.id
         WHERE tc.id = :checklistId`,
        {
          replacements: { checklistId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!checklistResult || checklistResult.length === 0) {
        throw new NotFoundException('Checklist não encontrada');
      }

      const checklist = checklistResult[0];

      if (!checklist.organization_id) {
        throw new NotFoundException('Tarefa ou projeto não encontrado');
      }

      // Verificar se o usuário tem acesso à checklist
      await this.checkUserProjectPermission(userId, checklist.organization_id);

      // Converter para o formato esperado
      return {
        id: checklist.id,
        name: checklist.name,
        projectTasksId: checklist.project_tasks_id,
        createdAt: checklist.created_at,
        updatedAt: checklist.updated_at,
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
    updateTaskChecklistDto: UpdateTaskChecklistDto,
    userId: string,
  ): Promise<TaskChecklistResponseDto> {
    try {
      // Buscar checklist usando SQL raw para obter informações do projeto
      const checklistResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tc.*, 
                pt.id as task_id,
                ps.project_id,
                p.organization_id
         FROM tasks_checklist tc
         JOIN project_tasks pt ON tc.project_tasks_id = pt.id
         JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         JOIN projects p ON ps.project_id = p.id
         WHERE tc.id = :checklistId`,
        {
          replacements: { checklistId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!checklistResult || checklistResult.length === 0) {
        throw new NotFoundException('Checklist não encontrada');
      }

      const checklist = checklistResult[0];

      if (!checklist.organization_id) {
        throw new NotFoundException('Tarefa ou projeto não encontrado');
      }

      // Verificar se o usuário tem permissão para editar a checklist
      await this.checkUserProjectPermission(userId, checklist.organization_id);

      // Preparar dados para atualização
      const updateData: any = {};
      if (updateTaskChecklistDto.name !== undefined) updateData.name = updateTaskChecklistDto.name;

      // Atualizar checklist usando SQL raw
      const setClause = Object.keys(updateData).map(key => `${key} = :${key}`).join(', ');
      const replacements: any = { checklistId: id };
      Object.keys(updateData).forEach(key => {
        replacements[key] = updateData[key];
      });

      await this.organizationUserModel.sequelize?.query(
        `UPDATE tasks_checklist SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = :checklistId`,
        {
          replacements,
          type: QueryTypes.UPDATE,
        }
      );

      // Buscar checklist atualizada usando SQL raw
      const updatedChecklistResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tc.*
         FROM tasks_checklist tc
         WHERE tc.id = :checklistId`,
        {
          replacements: { checklistId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      const updatedChecklist = updatedChecklistResult![0];

      // Converter para o formato esperado
      return {
        id: updatedChecklist.id,
        name: updatedChecklist.name,
        projectTasksId: updatedChecklist.project_tasks_id,
        createdAt: updatedChecklist.created_at,
        updatedAt: updatedChecklist.updated_at,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      // Buscar checklist usando SQL raw para obter informações do projeto
      const checklistResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tc.*, 
                pt.id as task_id,
                ps.project_id,
                p.organization_id
         FROM tasks_checklist tc
         JOIN project_tasks pt ON tc.project_tasks_id = pt.id
         JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         JOIN projects p ON ps.project_id = p.id
         WHERE tc.id = :checklistId`,
        {
          replacements: { checklistId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!checklistResult || checklistResult.length === 0) {
        throw new NotFoundException('Checklist não encontrada');
      }

      const checklist = checklistResult[0];

      if (!checklist.organization_id) {
        throw new NotFoundException('Tarefa ou projeto não encontrado');
      }

      // Verificar se o usuário tem permissão para excluir a checklist
      await this.checkUserProjectPermission(userId, checklist.organization_id);

      // Excluir a checklist usando SQL raw (os itens serão excluídos em cascata)
      await this.organizationUserModel.sequelize?.query(
        'DELETE FROM tasks_checklist WHERE id = :checklistId',
        {
          replacements: { checklistId: id },
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

  private formatChecklistResponse(checklist: TaskChecklist): TaskChecklistResponseDto {
    return {
      id: checklist.id,
      name: checklist.name,
      projectTasksId: checklist.projectTasksId,
      createdAt: checklist.createdAt,
      updatedAt: checklist.updatedAt,
    };
  }
}

