import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Team } from './team.model';
import { TeamUser } from './team-user.model';
import { User } from '../users/user.model';
import { CreateTeamDto } from './dto/create-team.dto';
import { AddUserToTeamDto } from './dto/add-user-to-team.dto';
import { TeamResponseDto, TeamWithUsersResponseDto } from './dto/team-response.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team)
    private readonly teamModel: typeof Team,
    @InjectModel(TeamUser)
    private readonly teamUserModel: typeof TeamUser,
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async create(
    createTeamDto: CreateTeamDto,
    userId: string,
  ): Promise<TeamResponseDto> {
    try {
      // Verificar se já existe um time com o mesmo nome para o mesmo usuário
      const existingTeam = await this.teamModel.findOne({
        where: { 
          name: createTeamDto.name,
          userOwnerId: userId,
        },
      });

      if (existingTeam) {
        throw new ConflictException('Você já possui um time com este nome');
      }

      // Criar time
      const team = await this.teamModel.create({
        name: createTeamDto.name,
        description: createTeamDto.description,
        userOwnerId: userId,
      } as any);

      return team.toJSON() as TeamResponseDto;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao criar time');
    }
  }

  async findTeamsByUser(userId: string): Promise<TeamWithUsersResponseDto[]> {
    try {
      // Buscar times onde o usuário é owner
      const ownedTeams = await this.teamModel.findAll({
        where: { userOwnerId: userId },
        include: [
          {
            model: TeamUser,
            as: 'teamUsers',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email'],
              },
            ],
          },
        ],
      });

      // Buscar times onde o usuário é membro
      const memberTeams = await this.teamModel.findAll({
        include: [
          {
            model: TeamUser,
            as: 'teamUsers',
            where: { userId: userId },
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email'],
              },
            ],
          },
        ],
      });

      // Combinar os resultados e remover duplicatas
      const allTeams = [...ownedTeams, ...memberTeams];
      const uniqueTeams = allTeams.filter((team, index, self) => 
        index === self.findIndex(t => t.id === team.id)
      );

      return uniqueTeams.map((team) => team.toJSON() as TeamWithUsersResponseDto);
    } catch (error) {
      console.error('Erro ao buscar times do usuário:', error);
      throw new InternalServerErrorException(
        'Não foi possível buscar os times do usuário',
      );
    }
  }

  async addUserToTeam(
    teamId: string,
    addUserToTeamDto: AddUserToTeamDto,
    ownerId: string,
  ): Promise<TeamWithUsersResponseDto> {
    try {
      // Verificar se o time existe
      const team = await this.teamModel.findByPk(teamId);

      if (!team) {
        throw new NotFoundException('Time não encontrado');
      }

      // Verificar se o usuário é o dono do time
      if (team.userOwnerId !== ownerId) {
        throw new ForbiddenException('Apenas o dono do time pode adicionar usuários');
      }

      // Verificar se o usuário a ser adicionado existe
      const userToAdd = await this.userModel.findByPk(addUserToTeamDto.userId);

      if (!userToAdd) {
        throw new NotFoundException('Usuário não encontrado');
      }

      // Verificar se o usuário já está no time
      const existingTeamUser = await this.teamUserModel.findOne({
        where: {
          teamId: teamId,
          userId: addUserToTeamDto.userId,
        },
      });

      if (existingTeamUser) {
        throw new ConflictException('Usuário já está neste time');
      }

      // Verificar se o usuário não está tentando se adicionar
      if (addUserToTeamDto.userId === ownerId) {
        throw new ConflictException('Você não pode se adicionar ao próprio time');
      }

      // Adicionar usuário ao time usando o nome completo do usuário
      await this.teamUserModel.create({
        name: userToAdd.fullName, // Usar o nome completo do usuário
        userId: addUserToTeamDto.userId,
        teamId: teamId,
      } as any);

      // Retornar o time atualizado com todos os usuários
      const updatedTeam = await this.teamModel.findByPk(teamId, {
        include: [
          {
            model: TeamUser,
            as: 'teamUsers',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName', 'email'],
              },
            ],
          },
        ],
      });

      if (!updatedTeam) {
        throw new NotFoundException('Time não encontrado após atualização');
      }

      return updatedTeam.toJSON() as TeamWithUsersResponseDto;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao adicionar usuário ao time');
    }
  }

  async removeUserFromTeam(
    teamId: string,
    userId: string,
    ownerId: string,
  ): Promise<{ message: string }> {
    try {
      // Verificar se o time existe
      const team = await this.teamModel.findByPk(teamId);

      if (!team) {
        throw new NotFoundException('Time não encontrado');
      }

      // Verificar se o usuário é o dono do time
      if (team.userOwnerId !== ownerId) {
        throw new ForbiddenException('Apenas o dono do time pode remover usuários');
      }

      // Verificar se o usuário está no time
      const teamUser = await this.teamUserModel.findOne({
        where: {
          teamId: teamId,
          userId: userId,
        },
      });

      if (!teamUser) {
        throw new NotFoundException('Usuário não está neste time');
      }

      // Remover usuário do time
      await teamUser.destroy();

      return { message: 'Usuário removido do time com sucesso' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao remover usuário do time');
    }
  }
}
