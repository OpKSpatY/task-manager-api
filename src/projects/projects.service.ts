import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { Project } from './project.model';
import { Organization } from '../organizations/organizations.model';
import { OrganizationUser, UserOrganizationPermission } from '../organizations/organization-user.model';
import { Team } from '../teams/team.model';
import { User } from '../users/user.model';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(Organization)
    private readonly organizationModel: typeof Organization,
    @InjectModel(OrganizationUser)
    private readonly organizationUserModel: typeof OrganizationUser,
    @InjectModel(Team)
    private readonly teamModel: typeof Team,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectResponseDto> {
    try {
      // Verificar se a organização existe
      const organization = await this.organizationModel.findByPk(
        createProjectDto.organizationId,
      );

      if (!organization) {
        throw new NotFoundException('Organização não encontrada');
      }

      // Verificar se o usuário tem permissão para criar projetos na organização
      await this.checkUserProjectPermission(userId, createProjectDto.organizationId);

      // Verificar se já existe um projeto com o mesmo nome na organização
      const existingProject = await this.projectModel.findOne({
        where: {
          name: createProjectDto.name,
          organizationId: createProjectDto.organizationId,
        },
      });

      if (existingProject) {
        throw new ConflictException('Já existe um projeto com este nome nesta organização');
      }

      // Verificar se o time existe (se fornecido)
      if (createProjectDto.teamAssignmentId) {
        const team = await this.teamModel.findByPk(createProjectDto.teamAssignmentId);
        if (!team) {
          throw new NotFoundException('Time não encontrado');
        }
      }

      // Criar projeto
      const projectData: any = {
        name: createProjectDto.name,
        description: createProjectDto.description,
        isProjectVisible: createProjectDto.isProjectVisible ?? true,
        organizationId: createProjectDto.organizationId,
      };

      if (createProjectDto.dueTime) {
        projectData.dueTime = new Date(createProjectDto.dueTime);
      }

      if (createProjectDto.teamAssignmentId) {
        projectData.teamAssignmentId = createProjectDto.teamAssignmentId;
      }

      const project = await this.projectModel.create(projectData);

      return this.formatProjectResponse(project);
    } catch (error) {
      if (error instanceof ConflictException || 
          error instanceof NotFoundException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async findAll(userId: string): Promise<ProjectResponseDto[]> {
    try {
      console.log('DEBUG - Finding all projects for user:', userId);

      // Buscar todas as organizações onde o usuário tem acesso usando SQL raw
      const userOrganizationsResult = await this.organizationUserModel.sequelize?.query(
        `SELECT DISTINCT o.id, o.name, o.description, o.organization_creator
         FROM organizations o
         WHERE o.organization_creator = :userId
         UNION
         SELECT DISTINCT o.id, o.name, o.description, o.organization_creator
         FROM organizations o
         JOIN organization_users ou ON o.id = ou.organization_id
         WHERE ou.user_id = :userId`,
        {
          replacements: { userId },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      console.log('DEBUG - User organizations:', userOrganizationsResult);

      if (!userOrganizationsResult || userOrganizationsResult.length === 0) {
        console.log('DEBUG - No organizations found for user');
        return [];
      }

      const organizationIds = userOrganizationsResult.map(org => org.id);
      console.log('DEBUG - Organization IDs:', organizationIds);

      // Buscar projetos das organizações do usuário usando SQL raw
      let projectsResult: any[];
      
      if (organizationIds.length === 1) {
        // Caso especial para uma única organização
        projectsResult = await this.organizationUserModel.sequelize?.query(
          `SELECT p.*, 
                  o.name as org_name, o.description as org_description,
                  t.name as team_name, t.description as team_description
           FROM projects p
           LEFT JOIN organizations o ON p.organization_id = o.id
           LEFT JOIN teams t ON p.team_assignment_id = t.id
           WHERE p.organization_id = :orgId
           ORDER BY p.created_at DESC`,
          {
            replacements: { orgId: organizationIds[0] },
            type: QueryTypes.SELECT,
          }
        ) as any[];
      } else {
        // Caso para múltiplas organizações
        const placeholders = organizationIds.map((_, index) => `:orgId${index}`).join(',');
        const replacements: any = {};
        organizationIds.forEach((id, index) => {
          replacements[`orgId${index}`] = id;
        });

        projectsResult = await this.organizationUserModel.sequelize?.query(
          `SELECT p.*, 
                  o.name as org_name, o.description as org_description,
                  t.name as team_name, t.description as team_description
           FROM projects p
           LEFT JOIN organizations o ON p.organization_id = o.id
           LEFT JOIN teams t ON p.team_assignment_id = t.id
           WHERE p.organization_id IN (${placeholders})
           ORDER BY p.created_at DESC`,
          {
            replacements,
            type: QueryTypes.SELECT,
          }
        ) as any[];
      }

      console.log('DEBUG - Projects found:', projectsResult?.length || 0);

      // Converter para o formato esperado
      const projects = projectsResult?.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        isProjectVisible: project.is_project_visible,
        organizationId: project.organization_id,
        dueTime: project.due_time,
        teamAssignmentId: project.team_assignment_id,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        organization: {
          id: project.organization_id,
          name: project.org_name,
          description: project.org_description,
        },
        teamAssignment: project.team_assignment_id ? {
          id: project.team_assignment_id,
          name: project.team_name,
          description: project.team_description,
        } : undefined,
      })) || [];

      return projects;
    } catch (error) {
      console.error('DEBUG - Error in findAll:', error);
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async findOne(id: string, userId: string): Promise<ProjectResponseDto> {
    try {
      console.log('DEBUG - Finding project with ID:', id, 'for user:', userId);

      // Buscar projeto usando SQL raw
      const projectResult = await this.organizationUserModel.sequelize?.query(
        `SELECT p.*, 
                o.name as org_name, o.description as org_description,
                t.name as team_name, t.description as team_description
         FROM projects p
         LEFT JOIN organizations o ON p.organization_id = o.id
         LEFT JOIN teams t ON p.team_assignment_id = t.id
         WHERE p.id = :projectId`,
        {
          replacements: { projectId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      console.log('DEBUG - Project query result:', projectResult);

      if (!projectResult || projectResult.length === 0) {
        throw new NotFoundException('Projeto não encontrado');
      }

      const project = projectResult[0];
      console.log('DEBUG - Project found:', project);
      console.log('DEBUG - Project organization ID:', project.organization_id);

      // Verificar se o usuário tem acesso ao projeto
      await this.checkUserProjectPermission(userId, project.organization_id);

      // Converter para o formato esperado
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        isProjectVisible: project.is_project_visible,
        organizationId: project.organization_id,
        dueTime: project.due_time,
        teamAssignmentId: project.team_assignment_id,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        organization: {
          id: project.organization_id,
          name: project.org_name,
          description: project.org_description,
        },
        teamAssignment: project.team_assignment_id ? {
          id: project.team_assignment_id,
          name: project.team_name,
          description: project.team_description,
        } : undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('DEBUG - Error in findOne:', error);
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectResponseDto> {
    try {
      console.log('DEBUG - Updating project with ID:', id, 'for user:', userId);

      // Buscar projeto usando SQL raw para obter o organizationId
      const projectResult = await this.organizationUserModel.sequelize?.query(
        'SELECT id, name, description, is_project_visible, organization_id, due_time, team_assignment_id FROM projects WHERE id = :projectId',
        {
          replacements: { projectId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      console.log('DEBUG - Project query result for update:', projectResult);

      if (!projectResult || projectResult.length === 0) {
        throw new NotFoundException('Projeto não encontrado');
      }

      const project = projectResult[0];
      console.log('DEBUG - Project found for update:', project);
      console.log('DEBUG - Project organization ID:', project.organization_id);

      // Verificar se o usuário tem permissão para editar o projeto
      await this.checkUserProjectPermission(userId, project.organization_id);

      // Verificar se o nome já existe (se fornecido)
      if (updateProjectDto.name && updateProjectDto.name !== project.name) {
        const existingProjectResult = await this.organizationUserModel.sequelize?.query(
          'SELECT id FROM projects WHERE name = :name AND organization_id = :organizationId AND id != :projectId',
          {
            replacements: { 
              name: updateProjectDto.name, 
              organizationId: project.organization_id,
              projectId: id 
            },
            type: QueryTypes.SELECT,
          }
        ) as any[];

        if (existingProjectResult && existingProjectResult.length > 0) {
          throw new ConflictException('Já existe um projeto com este nome nesta organização');
        }
      }

      // Verificar se o time existe (se fornecido)
      if (updateProjectDto.teamAssignmentId) {
        const teamResult = await this.organizationUserModel.sequelize?.query(
          'SELECT id FROM teams WHERE id = :teamId',
          {
            replacements: { teamId: updateProjectDto.teamAssignmentId },
            type: QueryTypes.SELECT,
          }
        ) as any[];

        if (!teamResult || teamResult.length === 0) {
          throw new NotFoundException('Time não encontrado');
        }
      }

      // Preparar dados para atualização
      const updateData: any = {};
      if (updateProjectDto.name !== undefined) updateData.name = updateProjectDto.name;
      if (updateProjectDto.description !== undefined) updateData.description = updateProjectDto.description;
      if (updateProjectDto.isProjectVisible !== undefined) updateData.is_project_visible = updateProjectDto.isProjectVisible;
      if (updateProjectDto.dueTime !== undefined) updateData.due_time = updateProjectDto.dueTime ? new Date(updateProjectDto.dueTime) : null;
      if (updateProjectDto.teamAssignmentId !== undefined) updateData.team_assignment_id = updateProjectDto.teamAssignmentId;

      // Atualizar projeto usando SQL raw
      const setClause = Object.keys(updateData).map(key => `${key} = :${key}`).join(', ');
      const replacements: any = { projectId: id };
      Object.keys(updateData).forEach(key => {
        replacements[key] = updateData[key];
      });

      await this.organizationUserModel.sequelize?.query(
        `UPDATE projects SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = :projectId`,
        {
          replacements,
          type: QueryTypes.UPDATE,
        }
      );

      console.log('DEBUG - Project updated successfully');

      // Buscar projeto atualizado com relacionamentos usando SQL raw
      const updatedProjectResult = await this.organizationUserModel.sequelize?.query(
        `SELECT p.*, 
                o.name as org_name, o.description as org_description,
                t.name as team_name, t.description as team_description
         FROM projects p
         LEFT JOIN organizations o ON p.organization_id = o.id
         LEFT JOIN teams t ON p.team_assignment_id = t.id
         WHERE p.id = :projectId`,
        {
          replacements: { projectId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      const updatedProject = updatedProjectResult![0];

      // Converter para o formato esperado
      return {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description,
        isProjectVisible: updatedProject.is_project_visible,
        organizationId: updatedProject.organization_id,
        dueTime: updatedProject.due_time,
        teamAssignmentId: updatedProject.team_assignment_id,
        createdAt: updatedProject.created_at,
        updatedAt: updatedProject.updated_at,
        organization: {
          id: updatedProject.organization_id,
          name: updatedProject.org_name,
          description: updatedProject.org_description,
        },
        teamAssignment: updatedProject.team_assignment_id ? {
          id: updatedProject.team_assignment_id,
          name: updatedProject.team_name,
          description: updatedProject.team_description,
        } : undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      console.error('DEBUG - Error in update:', error);
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      console.log('DEBUG - Removing project with ID:', id, 'for user:', userId);

      // Buscar projeto usando SQL raw para obter o organizationId
      const projectResult = await this.organizationUserModel.sequelize?.query(
        'SELECT id, organization_id FROM projects WHERE id = :projectId',
        {
          replacements: { projectId: id },
          type: QueryTypes.SELECT,
        }
      ) as any[];

      console.log('DEBUG - Project query result for removal:', projectResult);

      if (!projectResult || projectResult.length === 0) {
        throw new NotFoundException('Projeto não encontrado');
      }

      const project = projectResult[0];
      console.log('DEBUG - Project found for removal:', project);
      console.log('DEBUG - Project organization ID:', project.organization_id);

      // Verificar se o usuário tem permissão para excluir o projeto
      await this.checkUserProjectPermission(userId, project.organization_id);

      // Excluir o projeto usando SQL raw
      await this.organizationUserModel.sequelize?.query(
        'DELETE FROM projects WHERE id = :projectId',
        {
          replacements: { projectId: id },
          type: QueryTypes.DELETE,
        }
      );

      console.log('DEBUG - Project deleted successfully');
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('DEBUG - Error in remove:', error);
      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  private async checkUserProjectPermission(userId: string, organizationId: string): Promise<void> {
    console.log('DEBUG - Checking permissions for user:', userId, 'in organization:', organizationId);

    // Primeiro, verificar se o usuário existe
    const userResult = await this.organizationUserModel.sequelize?.query(
      'SELECT id, first_name, last_name, email FROM users WHERE id = :userId',
      {
        replacements: { userId },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    console.log('DEBUG - User query result:', userResult);

    if (!userResult || userResult.length === 0) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const user = userResult[0];
    console.log('DEBUG - User found:', user.email);

    // Verificar se a organização existe
    console.log('DEBUG - Looking for organization with ID:', organizationId);
    
    const organizationResult = await this.organizationUserModel.sequelize?.query(
      'SELECT id, name, description, organization_creator FROM organizations WHERE id = :organizationId',
      {
        replacements: { organizationId },
        type: QueryTypes.SELECT,
      }
    ) as any[];

    console.log('DEBUG - Raw organization query result:', organizationResult);

    if (!organizationResult || organizationResult.length === 0) {
      throw new NotFoundException('Organização não encontrada');
    }

    const organization = organizationResult[0];
    /*console.log('DEBUG - Organization found:', organization);
    console.log('DEBUG - Organization name:', organization.name);
    console.log('DEBUG - Organization creator:', organization.organization_creator);
    */
    // Verificar se o usuário é o criador da organização
    if (organization.organization_creator === userId) {
      console.log('DEBUG - User is organization creator');
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

    console.log('DEBUG - Raw organization_user query result:', organizationUserResult);

    if (!organizationUserResult || organizationUserResult.length === 0) {
      console.log('DEBUG - User has no access to organization');
      throw new ForbiddenException('Você não tem acesso a esta organização');
    }

    const organizationUser = organizationUserResult[0];
    console.log('DEBUG - Organization user found:', organizationUser);

    // Verificar se o usuário é administrador da organização
    if (organizationUser.user_organization_permission === 'ADMIN') {
      console.log('DEBUG - User is organization admin');
      return; // Usuário é administrador
    }

    // Verificar se o usuário tem permissão específica para criar projetos
    if (organizationUser.user_can_create_projects) {
      console.log('DEBUG - User can create projects');
      return; // Usuário tem permissão para criar projetos
    }

    console.log('DEBUG - User has no permission to create projects');
    throw new ForbiddenException('Você não tem permissão para realizar esta ação nesta organização');
  }

  private formatProjectResponse(project: Project): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      isProjectVisible: project.isProjectVisible,
      organizationId: project.organizationId,
      dueTime: project.dueTime,
      teamAssignmentId: project.teamAssignmentId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      organization: project.organization ? {
        id: project.organization.id,
        name: project.organization.name,
        description: project.organization.description,
      } : undefined,
      teamAssignment: project.teamAssignment ? {
        id: project.teamAssignment.id,
        name: project.teamAssignment.name,
        description: project.teamAssignment.description,
      } : undefined,
    };
  }
}
