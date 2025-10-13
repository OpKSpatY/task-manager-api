import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Organization } from './organizations.model';
import { OrganizationUser, UserOrganizationPermission } from './organization-user.model';
import { User } from '../users/user.model';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { AddUserToOrganizationDto } from './dto/add-user-to-organization.dto';
import { UpdateOrganizationUserDto } from './dto/update-organization-user.dto';
import { OrganizationUserResponseDto } from './dto/organization-user-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectModel(Organization)
    private readonly organizationModel: typeof Organization,
    @InjectModel(OrganizationUser)
    private readonly organizationUserModel: typeof OrganizationUser,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
    userId: string,
  ): Promise<OrganizationResponseDto> {
    try {
      // Verificar se já existe uma organização com o mesmo nome
      const existingOrganization = await this.organizationModel.findOne({
        where: { name: createOrganizationDto.name },
      });

      if (existingOrganization) {
        throw new ConflictException('Nome da organização já está em uso');
      }

      // Criar organização
      const organization = await this.organizationModel.create({
        name: createOrganizationDto.name,
        description: createOrganizationDto.description,
        organizationCreator: userId,
      } as any);

      return organization.toJSON() as OrganizationResponseDto;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao criar organização');
    }
  }

  async findAll(): Promise<OrganizationResponseDto[]> {
    try {
      const organizations = await this.organizationModel.findAll();
      return organizations.map(
        (organization) => organization.toJSON() as OrganizationResponseDto,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Não foi possível buscar as organizações',
      );
    }
  }

  async findOne(id: string): Promise<OrganizationResponseDto> {
    try {
      const organization = await this.organizationModel.findByPk(id);

      if (!organization) {
        throw new NotFoundException('Organização não encontrada');
      }

      return organization.toJSON() as OrganizationResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Não foi possível buscar a organização',
      );
    }
  }

  async findByCreator(userId: string): Promise<OrganizationResponseDto[]> {
    try {
      const organizations = await this.organizationModel.findAll({
        where: { organizationCreator: userId },
      });

      return organizations.map(
        (organization) => organization.toJSON() as OrganizationResponseDto,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Não foi possível buscar as organizações do usuário',
      );
    }
  }

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    userId: string,
  ): Promise<OrganizationResponseDto> {
    try {
      // Verificar se a organização existe
      const organization = await this.organizationModel.findByPk(id);

      if (!organization) {
        throw new NotFoundException('Organização não encontrada');
      }

      // Verificar se o usuário é o criador da organização
      if (organization.organizationCreator !== userId) {
        throw new ConflictException('Você não tem permissão para editar esta organização');
      }

      // Se o nome está sendo alterado, verificar se já existe outra organização com o mesmo nome
      if (updateOrganizationDto.name && updateOrganizationDto.name !== organization.name) {
        const existingOrganization = await this.organizationModel.findOne({
          where: { 
            name: updateOrganizationDto.name,
            id: { [Op.ne]: id }
          },
        });

        if (existingOrganization) {
          throw new ConflictException('Nome da organização já está em uso');
        }
      }

      // Atualizar organização
      await organization.update({
        name: updateOrganizationDto.name || organization.name,
        description: updateOrganizationDto.description !== undefined 
          ? updateOrganizationDto.description 
          : organization.description,
      });

      return organization.toJSON() as OrganizationResponseDto;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao atualizar organização');
    }
  }

  // Métodos para gerenciar usuários da organização

  async addUserToOrganization(
    organizationId: string,
    addUserDto: AddUserToOrganizationDto,
    currentUserId: string,
  ): Promise<OrganizationUserResponseDto> {
    try {
      // Verificar se a organização existe
      const organization = await this.organizationModel.findByPk(organizationId);
      if (!organization) {
        throw new NotFoundException('Organização não encontrada');
      }

      // Verificar se o usuário a ser adicionado existe
      const userToAdd = await this.userModel.findByPk(addUserDto.userId);
      if (!userToAdd) {
        throw new NotFoundException('Usuário não encontrado');
      }

      // CORREÇÃO: Usar dados brutos para obter o organizationCreator
      const rawOrganizationData = organization.get({ plain: true }) as any;
      const organizationCreatorFromDB = rawOrganizationData.organizationCreator;

      // VALIDAÇÃO: Não permitir que o criador da organização seja adicionado
      if (addUserDto.userId === organizationCreatorFromDB) {
        throw new BadRequestException('O criador da organização já é automaticamente membro e não pode ser adicionado novamente');
      }

      // Usar o requestingUserId do DTO em vez do currentUserId do token
      const requestingUserId = addUserDto.requestingUserId;

      // Se for o criador da organização, sempre tem permissão
      if (requestingUserId === organizationCreatorFromDB) {
        console.log('DEBUG - Usuário é o criador da organização, permitindo adição');
      } else {
        // Verificar se o usuário que está fazendo a requisição tem permissão para adicionar usuários
        const hasPermission = await this.checkUserOrganizationPermission(
          organizationId,
          requestingUserId,
          [UserOrganizationPermission.ADMIN],
          organization.organizationCreator,
        );

        if (!hasPermission) {
          throw new ForbiddenException('Você não tem permissão para adicionar usuários a esta organização');
        }
      }


      // VALIDAÇÃO: Verificar se o usuário já está na organização
      const existingRelation = await this.organizationUserModel.findOne({
        where: {
          userId: addUserDto.userId,
          organizationId: organizationId,
        },
      });

      if (existingRelation) {
        throw new ConflictException('Usuário já faz parte desta organização');
      }

      // Criar relação usuário-organização
      const organizationUser = await this.organizationUserModel.create({
        userId: addUserDto.userId,
        organizationId: organizationId,
        userCanCreateProjects: addUserDto.userCanCreateProjects ?? false,
        userOrganizationPermission: addUserDto.userOrganizationPermission ?? UserOrganizationPermission.USER,
      } as any);

      // Buscar o registro completo com relacionamentos
      const fullRecord = await this.organizationUserModel.findByPk(organizationUser.id, {
        include: [
          { model: User, as: 'user' },
          { model: Organization, as: 'organization' },
        ],
      });

      if (!fullRecord) {
        throw new InternalServerErrorException('Erro ao buscar registro criado');
      }

      return this.formatOrganizationUserResponse(fullRecord);
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ConflictException || 
          error instanceof ForbiddenException ||
          error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao adicionar usuário à organização');
    }
  }

  async removeUserFromOrganization(
    organizationId: string,
    userId: string,
    currentUserId: string,
  ): Promise<{ message: string }> {
    try {
      // Verificar se a organização existe
      const organization = await this.organizationModel.findByPk(organizationId);
      if (!organization) {
        throw new NotFoundException('Organização não encontrada');
      }

      // Verificar se o usuário a ser removido existe na organização
      const organizationUser = await this.organizationUserModel.findOne({
        where: {
          userId: userId,
          organizationId: organizationId,
        },
      });

      if (!organizationUser) {
        throw new NotFoundException('Usuário não encontrado nesta organização');
      }

      // Verificar permissões para remoção
      const isOwner = organization.organizationCreator === currentUserId;
      const isAdmin = await this.checkUserOrganizationPermission(
        organizationId,
        currentUserId,
        [UserOrganizationPermission.ADMIN],
        organization.organizationCreator,
      );
      const isRemovingSelf = userId === currentUserId;

      if (!isOwner && !isAdmin && !isRemovingSelf) {
        throw new ForbiddenException('Você não tem permissão para remover este usuário da organização');
      }

      // Não permitir que o dono da organização seja removido
      if (userId === organization.organizationCreator) {
        throw new BadRequestException('O criador da organização não pode ser removido');
      }

      // Remover usuário da organização
      await organizationUser.destroy();

      return { message: 'Usuário removido da organização com sucesso' };
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException || 
          error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao remover usuário da organização');
    }
  }

  async updateOrganizationUser(
    organizationId: string,
    userId: string,
    updateDto: UpdateOrganizationUserDto,
    currentUserId: string,
  ): Promise<OrganizationUserResponseDto> {
    try {
      // Verificar se a organização existe
      const organization = await this.organizationModel.findByPk(organizationId);
      if (!organization) {
        throw new NotFoundException('Organização não encontrada');
      }

      // Verificar se o usuário existe na organização
      const organizationUser = await this.organizationUserModel.findOne({
        where: {
          userId: userId,
          organizationId: organizationId,
        },
        include: [
          { model: User, as: 'user' },
          { model: Organization, as: 'organization' },
        ],
      });

      if (!organizationUser) {
        throw new NotFoundException('Usuário não encontrado nesta organização');
      }

      // Verificar permissões para atualização
      const isOwner = organization.organizationCreator === currentUserId;
      const isAdmin = await this.checkUserOrganizationPermission(
        organizationId,
        currentUserId,
        [UserOrganizationPermission.ADMIN],
        organization.organizationCreator,
      );

      if (!isOwner && !isAdmin) {
        throw new ForbiddenException('Você não tem permissão para atualizar este usuário');
      }

      // Atualizar dados do usuário na organização
      await organizationUser.update({
        userCanCreateProjects: updateDto.userCanCreateProjects !== undefined 
          ? updateDto.userCanCreateProjects 
          : organizationUser.userCanCreateProjects,
        userOrganizationPermission: updateDto.userOrganizationPermission !== undefined 
          ? updateDto.userOrganizationPermission 
          : organizationUser.userOrganizationPermission,
      });

      // Buscar o registro atualizado
      const updatedRecord = await this.organizationUserModel.findByPk(organizationUser.id, {
        include: [
          { model: User, as: 'user' },
          { model: Organization, as: 'organization' },
        ],
      });

      if (!updatedRecord) {
        throw new InternalServerErrorException('Erro ao buscar registro atualizado');
      }

      return this.formatOrganizationUserResponse(updatedRecord);
    } catch (error) {
      if (error instanceof NotFoundException || 
          error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao atualizar usuário da organização');
    }
  }

  async getOrganizationUsers(
    organizationId: string,
    currentUserId: string,
  ): Promise<OrganizationUserResponseDto[]> {
    try {
      // Verificar se a organização existe
      const organization = await this.organizationModel.findByPk(organizationId);
      if (!organization) {
        throw new NotFoundException('Organização não encontrada');
      }

      // Verificar se o usuário atual tem acesso à organização
      const hasAccess = await this.checkUserOrganizationAccess(organizationId, currentUserId);
      if (!hasAccess) {
        throw new ForbiddenException('Você não tem acesso a esta organização');
      }

      // Buscar todos os usuários da organização
      const organizationUsers = await this.organizationUserModel.findAll({
        where: { organizationId },
        include: [
          { model: User, as: 'user' },
          { model: Organization, as: 'organization' },
        ],
      });

      // Criar um objeto para o criador da organização (se não estiver na tabela organization_users)
      const creatorInTable = organizationUsers.find(ou => ou.userId === organization.organizationCreator);
      let result = organizationUsers.map(user => this.formatOrganizationUserResponse(user));

      // Se o criador não estiver na tabela organization_users, adicionar ele como ADMIN
      if (!creatorInTable) {
        const creatorUser = await this.userModel.findByPk(organization.organizationCreator);
        if (creatorUser) {
          const creatorResponse: OrganizationUserResponseDto = {
            id: `creator-${organization.organizationCreator}`,
            userId: organization.organizationCreator,
            organizationId: organizationId,
            userCanCreateProjects: true, // Criador sempre pode criar projetos
            userOrganizationPermission: UserOrganizationPermission.ADMIN, // Criador sempre é ADMIN
            createdAt: organization.createdAt,
            updatedAt: organization.updatedAt,
            user: {
              id: creatorUser.id,
              firstName: creatorUser.firstName,
              lastName: creatorUser.lastName,
              email: creatorUser.email,
              fullName: creatorUser.fullName,
            },
            organization: {
              id: organization.id,
              name: organization.name,
              description: organization.description,
            },
          };
          result.unshift(creatorResponse); // Adicionar no início da lista
        }
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao buscar usuários da organização');
    }
  }

  // Método temporário para debug - verificar dados diretamente do banco
  async debugOrganizationData(organizationId: string): Promise<any> {
    const organization = await this.organizationModel.findByPk(organizationId);
    if (!organization) {
      return { error: 'Organização não encontrada' };
    }

    // Buscar todos os usuários da organização
    const organizationUsers = await this.organizationUserModel.findAll({
      where: { organizationId },
      include: [{ model: User, as: 'user' }],
    });

    // Verificar dados brutos do banco
    const rawData = organization.get({ plain: true });

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        organizationCreator: organization.organizationCreator,
        organizationCreatorType: typeof organization.organizationCreator,
        rawData: rawData, // Dados brutos do banco
      },
      organizationUsers: organizationUsers.map(ou => ({
        id: ou.id,
        userId: ou.userId,
        userIdType: typeof ou.userId,
        permission: ou.userOrganizationPermission,
        userEmail: ou.user?.email,
      })),
    };
  }

  // Método temporário para debug
  async debugUserPermission(organizationId: string, userId: string): Promise<any> {
    const organization = await this.organizationModel.findByPk(organizationId);
    if (!organization) {
      return { error: 'Organização não encontrada' };
    }

    const isCreator = userId === organization.organizationCreator;
    
    const organizationUser = await this.organizationUserModel.findOne({
      where: {
        userId,
        organizationId,
      },
    });

    return {
      organizationId,
      userId,
      organizationCreator: organization.organizationCreator,
      isCreator,
      hasOrganizationUserRecord: !!organizationUser,
      organizationUserPermission: organizationUser?.userOrganizationPermission,
    };
  }

  // Métodos auxiliares

  private async checkUserOrganizationPermission(
    organizationId: string,
    userId: string,
    requiredPermissions: UserOrganizationPermission[],
    organizationCreator?: string,
  ): Promise<boolean> {
    /*console.log('DEBUG - checkUserOrganizationPermission:', {
      organizationId,
      userId,
      organizationCreator,
      requiredPermissions,
      userIdType: typeof userId,
      organizationCreatorType: typeof organizationCreator,
      strictEqual: userId === organizationCreator,
      looseEqual: userId == organizationCreator,
    });*/

    // Se for o criador da organização, sempre tem permissão
    if (organizationCreator && userId === organizationCreator) {
      console.log('DEBUG - Usuário é o criador da organização, retornando true');
      return true;
    }

    // Verificar permissões do usuário na organização
    const organizationUser = await this.organizationUserModel.findOne({
      where: {
        userId,
        organizationId,
        userOrganizationPermission: { [Op.in]: requiredPermissions },
      },
    });

    console.log('DEBUG - Resultado da busca na tabela organization_users:', {
      found: !!organizationUser,
      organizationUser: organizationUser ? {
        id: organizationUser.id,
        userId: organizationUser.userId,
        organizationId: organizationUser.organizationId,
        permission: organizationUser.userOrganizationPermission,
      } : null,
    });

    return !!organizationUser;
  }

  private async checkUserOrganizationAccess(
    organizationId: string,
    userId: string,
  ): Promise<boolean> {
    // Verificar se é o criador da organização
    const organization = await this.organizationModel.findByPk(organizationId);
    if (organization && organization.organizationCreator === userId) {
      return true;
    }

    // Verificar se é membro da organização
    const organizationUser = await this.organizationUserModel.findOne({
      where: {
        userId,
        organizationId,
      },
    });

    return !!organizationUser;
  }

  private formatOrganizationUserResponse(organizationUser: OrganizationUser): OrganizationUserResponseDto {
    const response: OrganizationUserResponseDto = {
      id: organizationUser.id,
      userId: organizationUser.userId,
      organizationId: organizationUser.organizationId,
      userCanCreateProjects: organizationUser.userCanCreateProjects,
      userOrganizationPermission: organizationUser.userOrganizationPermission,
      createdAt: organizationUser.createdAt,
      updatedAt: organizationUser.updatedAt,
    };

    if (organizationUser.user) {
      response.user = {
        id: organizationUser.user.id,
        firstName: organizationUser.user.firstName,
        lastName: organizationUser.user.lastName,
        email: organizationUser.user.email,
        fullName: organizationUser.user.fullName,
      };
    }

    if (organizationUser.organization) {
      response.organization = {
        id: organizationUser.organization.id,
        name: organizationUser.organization.name,
        description: organizationUser.organization.description,
      };
    }

    return response;
  }
}
