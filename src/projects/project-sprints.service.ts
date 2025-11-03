import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';
import { ProjectSprint } from './project-sprint.model';
import { Project } from './project.model';
import { Organization } from '../organizations/organizations.model';
import { OrganizationUser } from '../organizations/organization-user.model';
import { CreateProjectSprintDto } from './dto/create-project-sprint.dto';
import { UpdateProjectSprintDto } from './dto/update-project-sprint.dto';
import { ProjectSprintResponseDto } from './dto/project-sprint-response.dto';

@Injectable()
export class ProjectSprintsService {
  constructor(
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
    createProjectSprintDto: CreateProjectSprintDto,
    userId: string,
  ): Promise<ProjectSprintResponseDto> {
    try {
      // Verificar se o projeto existe
      const projectResult = await this.organizationUserModel.sequelize?.query(
        `SELECT p.*, o.organization_creator
         FROM projects p
         JOIN organizations o ON p.organization_id = o.id
         WHERE p.id = :projectId`,
        {
          replacements: { projectId: createProjectSprintDto.projectId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!projectResult || projectResult.length === 0) {
        throw new NotFoundException('Projeto não encontrado');
      }

      const project = projectResult[0];

      // Verificar se o usuário tem permissão para criar sprints no projeto
      await this.checkUserProjectPermission(userId, project.organization_id);

      // Validar que a data de início não é posterior à data de término
      const beginAt = new Date(createProjectSprintDto.beginAt);
      const dueAt = new Date(createProjectSprintDto.dueAt);

      if (beginAt > dueAt) {
        throw new BadRequestException('A data de início não pode ser posterior à data de término');
      }

      // Verificar se há sprints com datas sobrepostas
      const overlappingSprints = await this.organizationUserModel.sequelize?.query(
        `SELECT id, name, begin_at, due_at
         FROM project_sprints
         WHERE project_id = :projectId
         AND (
           (begin_at <= :dueAt AND due_at >= :beginAt)
         )`,
        {
          replacements: { 
            projectId: createProjectSprintDto.projectId,
            beginAt: beginAt.toISOString().split('T')[0], // Formato YYYY-MM-DD
            dueAt: dueAt.toISOString().split('T')[0]
          },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (overlappingSprints && overlappingSprints.length > 0) {
        throw new BadRequestException(
          'Não é possível criar uma sprint com datas que se sobreponham a outra sprint existente no projeto'
        );
      }

      // Criar sprint
      const sprintData: any = {
        name: createProjectSprintDto.name,
        projectId: createProjectSprintDto.projectId,
        beginAt: beginAt,
        dueAt: dueAt,
      };

      const sprint = await this.projectSprintModel.create(sprintData);

      return this.formatSprintResponse(sprint);
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException ||
          error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async findAll(projectId: string, userId: string): Promise<ProjectSprintResponseDto[]> {
    try {
      // Verificar se o projeto existe e se o usuário tem acesso
      const projectResult = await this.organizationUserModel.sequelize?.query(
        `SELECT p.*, o.organization_creator
         FROM projects p
         JOIN organizations o ON p.organization_id = o.id
         WHERE p.id = :projectId`,
        {
          replacements: { projectId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!projectResult || projectResult.length === 0) {
        throw new NotFoundException('Projeto não encontrado');
      }

      const project = projectResult[0];

      // Verificar se o usuário tem acesso ao projeto
      await this.checkUserProjectPermission(userId, project.organization_id);

      // Buscar sprints usando SQL raw
      const sprintsResult = await this.organizationUserModel.sequelize?.query(
        `SELECT ps.*, 
                p.name as project_name, p.description as project_description
         FROM project_sprints ps
         LEFT JOIN projects p ON ps.project_id = p.id
         WHERE ps.project_id = :projectId
         ORDER BY ps.begin_at DESC`,
        {
          replacements: { projectId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      // Converter para o formato esperado
      const sprints = sprintsResult?.map(sprint => ({
        id: sprint.id,
        name: sprint.name,
        projectId: sprint.project_id,
        beginAt: sprint.begin_at,
        dueAt: sprint.due_at,
        createdAt: sprint.created_at,
        updatedAt: sprint.updated_at,
        project: {
          id: sprint.project_id,
          name: sprint.project_name,
          description: sprint.project_description,
        },
      })) || [];

      return sprints;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async findOne(id: string, userId: string): Promise<ProjectSprintResponseDto> {
    try {
      // Buscar sprint usando SQL raw
      const sprintResult = await this.organizationUserModel.sequelize?.query(
        `SELECT ps.*, 
                p.name as project_name, p.description as project_description,
                p.organization_id
         FROM project_sprints ps
         LEFT JOIN projects p ON ps.project_id = p.id
         WHERE ps.id = :sprintId`,
        {
          replacements: { sprintId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!sprintResult || sprintResult.length === 0) {
        throw new NotFoundException('Sprint não encontrada');
      }

      const sprint = sprintResult[0];

      if (!sprint.organization_id) {
        throw new NotFoundException('Projeto não encontrado');
      }

      // Verificar se o usuário tem acesso ao projeto
      await this.checkUserProjectPermission(userId, sprint.organization_id);

      // Converter para o formato esperado
      return {
        id: sprint.id,
        name: sprint.name,
        projectId: sprint.project_id,
        beginAt: sprint.begin_at,
        dueAt: sprint.due_at,
        createdAt: sprint.created_at,
        updatedAt: sprint.updated_at,
        project: {
          id: sprint.project_id,
          name: sprint.project_name,
          description: sprint.project_description,
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
    updateProjectSprintDto: UpdateProjectSprintDto,
    userId: string,
  ): Promise<ProjectSprintResponseDto> {
    try {
      // Buscar sprint usando SQL raw para obter o projectId e organizationId
      const sprintResult = await this.organizationUserModel.sequelize?.query(
        `SELECT ps.*, 
                p.organization_id
         FROM project_sprints ps
         LEFT JOIN projects p ON ps.project_id = p.id
         WHERE ps.id = :sprintId`,
        {
          replacements: { sprintId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!sprintResult || sprintResult.length === 0) {
        throw new NotFoundException('Sprint não encontrada');
      }

      const sprint = sprintResult[0];

      if (!sprint.organization_id) {
        throw new NotFoundException('Projeto não encontrado');
      }

      // Verificar se o usuário tem permissão para editar a sprint
      await this.checkUserProjectPermission(userId, sprint.organization_id);

      // Calcular as datas finais (do DTO ou da sprint existente)
      const finalBeginAt = updateProjectSprintDto.beginAt 
        ? new Date(updateProjectSprintDto.beginAt)
        : new Date(sprint.begin_at);
      const finalDueAt = updateProjectSprintDto.dueAt
        ? new Date(updateProjectSprintDto.dueAt)
        : new Date(sprint.due_at);

      // Validar que a data de início não é posterior à data de término
      if (finalBeginAt > finalDueAt) {
        throw new BadRequestException('A data de início não pode ser posterior à data de término');
      }

      // Verificar se há sprints com datas sobrepostas (excluindo a sprint atual)
      if (updateProjectSprintDto.beginAt || updateProjectSprintDto.dueAt) {
        const overlappingSprints = await this.organizationUserModel.sequelize?.query(
          `SELECT id, name, begin_at, due_at
           FROM project_sprints
           WHERE project_id = :projectId
           AND id != :sprintId
           AND (
             (begin_at <= :dueAt AND due_at >= :beginAt)
           )`,
          {
            replacements: { 
              projectId: sprint.project_id,
              sprintId: id,
              beginAt: finalBeginAt.toISOString().split('T')[0], // Formato YYYY-MM-DD
              dueAt: finalDueAt.toISOString().split('T')[0]
            },
            type: QueryTypes.SELECT,
          }
        ) as any[];

        if (overlappingSprints && overlappingSprints.length > 0) {
          throw new BadRequestException(
            'Não é possível atualizar uma sprint com datas que se sobreponham a outra sprint existente no projeto'
          );
        }
      }

      // Preparar dados para atualização
      const updateData: any = {};
      if (updateProjectSprintDto.name !== undefined) updateData.name = updateProjectSprintDto.name;
      if (updateProjectSprintDto.beginAt !== undefined) updateData.begin_at = new Date(updateProjectSprintDto.beginAt);
      if (updateProjectSprintDto.dueAt !== undefined) updateData.due_at = new Date(updateProjectSprintDto.dueAt);

      // Atualizar sprint usando SQL raw
      const setClause = Object.keys(updateData).map(key => `${key} = :${key}`).join(', ');
      const replacements: any = { sprintId: id };
      Object.keys(updateData).forEach(key => {
        replacements[key] = updateData[key];
      });

      await this.organizationUserModel.sequelize?.query(
        `UPDATE project_sprints SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = :sprintId`,
        {
          replacements,
          type: QueryTypes.UPDATE,
        }
      );

      // Buscar sprint atualizada com relacionamentos usando SQL raw
      const updatedSprintResult = await this.organizationUserModel.sequelize?.query(
        `SELECT ps.*, 
                p.name as project_name, p.description as project_description
         FROM project_sprints ps
         LEFT JOIN projects p ON ps.project_id = p.id
         WHERE ps.id = :sprintId`,
        {
          replacements: { sprintId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      const updatedSprint = updatedSprintResult![0];

      // Converter para o formato esperado
      return {
        id: updatedSprint.id,
        name: updatedSprint.name,
        projectId: updatedSprint.project_id,
        beginAt: updatedSprint.begin_at,
        dueAt: updatedSprint.due_at,
        createdAt: updatedSprint.created_at,
        updatedAt: updatedSprint.updated_at,
        project: {
          id: updatedSprint.project_id,
          name: updatedSprint.project_name,
          description: updatedSprint.project_description,
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
      // Buscar sprint usando SQL raw para obter o projectId e organizationId
      const sprintResult = await this.organizationUserModel.sequelize?.query(
        `SELECT ps.*, 
                p.organization_id
         FROM project_sprints ps
         LEFT JOIN projects p ON ps.project_id = p.id
         WHERE ps.id = :sprintId`,
        {
          replacements: { sprintId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      if (!sprintResult || sprintResult.length === 0) {
        throw new NotFoundException('Sprint não encontrada');
      }

      const sprint = sprintResult[0];

      if (!sprint.organization_id) {
        throw new NotFoundException('Projeto não encontrado');
      }

      // Verificar se o usuário tem permissão para excluir a sprint
      await this.checkUserProjectPermission(userId, sprint.organization_id);

      // Excluir a sprint usando SQL raw
      await this.organizationUserModel.sequelize?.query(
        'DELETE FROM project_sprints WHERE id = :sprintId',
        {
          replacements: { sprintId: id },
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

  private formatSprintResponse(sprint: ProjectSprint): ProjectSprintResponseDto {
    return {
      id: sprint.id,
      name: sprint.name,
      projectId: sprint.projectId,
      beginAt: sprint.beginAt,
      dueAt: sprint.dueAt,
      createdAt: sprint.createdAt,
      updatedAt: sprint.updatedAt,
      project: sprint.project ? {
        id: sprint.project.id,
        name: sprint.project.name,
        description: sprint.project.description,
      } : undefined,
    };
  }
}

