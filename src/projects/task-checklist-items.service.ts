import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';
import { TaskChecklistItem } from './task-checklist-item.model';
import { TaskChecklist } from './task-checklist.model';
import { Organization } from '../organizations/organizations.model';
import { OrganizationUser } from '../organizations/organization-user.model';
import { CreateTaskChecklistItemDto } from './dto/create-task-checklist-item.dto';
import { UpdateTaskChecklistItemDto } from './dto/update-task-checklist-item.dto';
import { TaskChecklistItemResponseDto } from './dto/task-checklist-item-response.dto';

@Injectable()
export class TaskChecklistItemsService {
  constructor(
    @InjectModel(TaskChecklistItem)
    private readonly taskChecklistItemModel: typeof TaskChecklistItem,
    @InjectModel(TaskChecklist)
    private readonly taskChecklistModel: typeof TaskChecklist,
    @InjectModel(Organization)
    private readonly organizationModel: typeof Organization,
    @InjectModel(OrganizationUser)
    private readonly organizationUserModel: typeof OrganizationUser,
  ) {}

  async create(
    createTaskChecklistItemDto: CreateTaskChecklistItemDto,
    userId: string,
  ): Promise<TaskChecklistItemResponseDto> {
    try {
      // Verificar se a checklist existe e obter informações do projeto
      const checklistResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tc.*, 
                pt.id as task_id,
                ps.project_id,
                p.organization_id,
                o.organization_creator
         FROM tasks_checklist tc
         JOIN project_tasks pt ON tc.project_tasks_id = pt.id
         JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         JOIN projects p ON ps.project_id = p.id
         JOIN organizations o ON p.organization_id = o.id
         WHERE tc.id = :checklistId`,
        {
          replacements: { checklistId: createTaskChecklistItemDto.tasksChecklistId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!checklistResult || checklistResult.length === 0) {
        throw new NotFoundException('Checklist não encontrada');
      }

      const checklist = checklistResult[0];

      // Verificar se o usuário tem permissão para criar itens na checklist
      await this.checkUserProjectPermission(userId, checklist.organization_id);

      // Criar item da checklist
      const itemData: any = {
        itemDescription: createTaskChecklistItemDto.itemDescription,
        isCompleted: createTaskChecklistItemDto.isCompleted || false,
        tasksChecklistId: createTaskChecklistItemDto.tasksChecklistId,
      };

      const item = await this.taskChecklistItemModel.create(itemData);

      return this.formatItemResponse(item);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async findAll(checklistId: string, userId: string): Promise<TaskChecklistItemResponseDto[]> {
    try {
      // Verificar se a checklist existe e se o usuário tem acesso
      const checklistResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tc.*, 
                pt.id as task_id,
                ps.project_id,
                p.organization_id,
                o.organization_creator
         FROM tasks_checklist tc
         JOIN project_tasks pt ON tc.project_tasks_id = pt.id
         JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         JOIN projects p ON ps.project_id = p.id
         JOIN organizations o ON p.organization_id = o.id
         WHERE tc.id = :checklistId`,
        {
          replacements: { checklistId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!checklistResult || checklistResult.length === 0) {
        throw new NotFoundException('Checklist não encontrada');
      }

      const checklist = checklistResult[0];

      // Verificar se o usuário tem acesso à checklist
      await this.checkUserProjectPermission(userId, checklist.organization_id);

      // Buscar itens usando SQL raw
      const itemsResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tci.*
         FROM tasks_checklist_items tci
         WHERE tci.tasks_checklist_id = :checklistId
         ORDER BY tci.created_at ASC`,
        {
          replacements: { checklistId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      // Converter para o formato esperado
      const items = itemsResult?.map(item => ({
        id: item.id,
        itemDescription: item.item_description,
        isCompleted: item.is_completed,
        tasksChecklistId: item.tasks_checklist_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) || [];

      return items;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async findOne(id: string, userId: string): Promise<TaskChecklistItemResponseDto> {
    try {
      // Buscar item usando SQL raw
      const itemResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tci.*, 
                tc.project_tasks_id,
                pt.id as task_id,
                ps.project_id,
                p.organization_id
         FROM tasks_checklist_items tci
         JOIN tasks_checklist tc ON tci.tasks_checklist_id = tc.id
         JOIN project_tasks pt ON tc.project_tasks_id = pt.id
         JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         JOIN projects p ON ps.project_id = p.id
         WHERE tci.id = :itemId`,
        {
          replacements: { itemId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!itemResult || itemResult.length === 0) {
        throw new NotFoundException('Item da checklist não encontrado');
      }

      const item = itemResult[0];

      if (!item.organization_id) {
        throw new NotFoundException('Checklist, tarefa ou projeto não encontrado');
      }

      // Verificar se o usuário tem acesso ao item
      await this.checkUserProjectPermission(userId, item.organization_id);

      // Converter para o formato esperado
      return {
        id: item.id,
        itemDescription: item.item_description,
        isCompleted: item.is_completed,
        tasksChecklistId: item.tasks_checklist_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
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
    updateTaskChecklistItemDto: UpdateTaskChecklistItemDto,
    userId: string,
  ): Promise<TaskChecklistItemResponseDto> {
    try {
      // Buscar item usando SQL raw para obter informações do projeto
      const itemResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tci.*, 
                tc.project_tasks_id,
                pt.id as task_id,
                ps.project_id,
                p.organization_id
         FROM tasks_checklist_items tci
         JOIN tasks_checklist tc ON tci.tasks_checklist_id = tc.id
         JOIN project_tasks pt ON tc.project_tasks_id = pt.id
         JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         JOIN projects p ON ps.project_id = p.id
         WHERE tci.id = :itemId`,
        {
          replacements: { itemId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!itemResult || itemResult.length === 0) {
        throw new NotFoundException('Item da checklist não encontrado');
      }

      const item = itemResult[0];

      if (!item.organization_id) {
        throw new NotFoundException('Checklist, tarefa ou projeto não encontrado');
      }

      // Verificar se o usuário tem permissão para editar o item
      await this.checkUserProjectPermission(userId, item.organization_id);

      // Preparar dados para atualização
      const updateData: any = {};
      if (updateTaskChecklistItemDto.itemDescription !== undefined) {
        updateData.item_description = updateTaskChecklistItemDto.itemDescription;
      }
      if (updateTaskChecklistItemDto.isCompleted !== undefined) {
        updateData.is_completed = updateTaskChecklistItemDto.isCompleted;
      }

      // Atualizar item usando SQL raw
      const setClause = Object.keys(updateData).map(key => `${key} = :${key}`).join(', ');
      const replacements: any = { itemId: id };
      Object.keys(updateData).forEach(key => {
        replacements[key] = updateData[key];
      });

      await this.organizationUserModel.sequelize?.query(
        `UPDATE tasks_checklist_items SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = :itemId`,
        {
          replacements,
          type: QueryTypes.UPDATE,
        }
      );

      // Buscar item atualizado usando SQL raw
      const updatedItemResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tci.*
         FROM tasks_checklist_items tci
         WHERE tci.id = :itemId`,
        {
          replacements: { itemId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      const updatedItem = updatedItemResult![0];

      // Converter para o formato esperado
      return {
        id: updatedItem.id,
        itemDescription: updatedItem.item_description,
        isCompleted: updatedItem.is_completed,
        tasksChecklistId: updatedItem.tasks_checklist_id,
        createdAt: updatedItem.created_at,
        updatedAt: updatedItem.updated_at,
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
      // Buscar item usando SQL raw para obter informações do projeto
      const itemResult = await this.organizationUserModel.sequelize?.query(
        `SELECT tci.*, 
                tc.project_tasks_id,
                pt.id as task_id,
                ps.project_id,
                p.organization_id
         FROM tasks_checklist_items tci
         JOIN tasks_checklist tc ON tci.tasks_checklist_id = tc.id
         JOIN project_tasks pt ON tc.project_tasks_id = pt.id
         JOIN project_sprints ps ON pt.project_sprint_id = ps.id
         JOIN projects p ON ps.project_id = p.id
         WHERE tci.id = :itemId`,
        {
          replacements: { itemId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!itemResult || itemResult.length === 0) {
        throw new NotFoundException('Item da checklist não encontrado');
      }

      const item = itemResult[0];

      if (!item.organization_id) {
        throw new NotFoundException('Checklist, tarefa ou projeto não encontrado');
      }

      // Verificar se o usuário tem permissão para excluir o item
      await this.checkUserProjectPermission(userId, item.organization_id);

      // Excluir o item usando SQL raw
      await this.organizationUserModel.sequelize?.query(
        'DELETE FROM tasks_checklist_items WHERE id = :itemId',
        {
          replacements: { itemId: id },
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

  private formatItemResponse(item: TaskChecklistItem): TaskChecklistItemResponseDto {
    return {
      id: item.id,
      itemDescription: item.itemDescription,
      isCompleted: item.isCompleted,
      tasksChecklistId: item.tasksChecklistId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}


