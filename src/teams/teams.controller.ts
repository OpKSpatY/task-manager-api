import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { AddUserToTeamDto } from './dto/add-user-to-team.dto';
import { TeamResponseDto, TeamWithUsersResponseDto } from './dto/team-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar novo time',
    description: 'Cria um novo time no sistema (requer autenticação)',
  })
  @ApiResponse({
    status: 201,
    description: 'Time criado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Time criado com sucesso' },
        team: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 409,
    description: 'Nome do time já está em uso',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao criar time',
  })
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() user: any,
  ): Promise<{
    message: string;
    team: TeamResponseDto;
  }> {
    const team = await this.teamsService.create(createTeamDto, user.id);

    return {
      message: 'Time criado com sucesso',
      team,
    };
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário para buscar seus times',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  @ApiOperation({
    summary: 'Buscar times do usuário',
    description: 'Retorna todos os times onde o usuário é proprietário ou membro (requer autenticação)',
  })
  @ApiResponse({
    status: 200,
    description: 'Times do usuário retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Times do usuário listados com sucesso' },
        teams: {
          type: 'array',
          items: { type: 'object' },
        },
        count: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao buscar times',
  })
  async findTeamsByUser(
    @Param('userId') userId: string,
  ): Promise<{
    message: string;
    teams: TeamWithUsersResponseDto[];
    count: number;
  }> {
    const teams = await this.teamsService.findTeamsByUser(userId);

    return {
      message: 'Times do usuário listados com sucesso',
      teams,
      count: teams.length,
    };
  }

  @Post(':teamId/users')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'teamId',
    description: 'ID do time',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  @ApiOperation({
    summary: 'Adicionar usuário ao time',
    description: 'Adiciona um usuário ao time usando apenas o ID do usuário (apenas o dono do time pode fazer isso)',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário adicionado ao time com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuário adicionado ao time com sucesso' },
        team: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas o dono do time pode adicionar usuários',
  })
  @ApiResponse({
    status: 404,
    description: 'Time ou usuário não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Usuário já está no time ou tentativa de auto-adicionar',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao adicionar usuário',
  })
  async addUserToTeam(
    @Param('teamId') teamId: string,
    @Body() addUserToTeamDto: AddUserToTeamDto,
    @CurrentUser() user: any,
  ): Promise<{
    message: string;
    team: TeamWithUsersResponseDto;
  }> {
    const team = await this.teamsService.addUserToTeam(
      teamId,
      addUserToTeamDto,
      user.id,
    );

    return {
      message: 'Usuário adicionado ao time com sucesso',
      team,
    };
  }

  @Delete(':teamId/users/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'teamId',
    description: 'ID do time',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário a ser removido',
    example: 'b4f2a4d5-ef9e-42e7-b62d-2e4d0d6c0f5b',
  })
  @ApiOperation({
    summary: 'Remover usuário do time',
    description: 'Remove um usuário do time (apenas o dono do time pode fazer isso)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário removido do time com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuário removido do time com sucesso' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas o dono do time pode remover usuários',
  })
  @ApiResponse({
    status: 404,
    description: 'Time não encontrado ou usuário não está no time',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao remover usuário',
  })
  async removeUserFromTeam(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    const result = await this.teamsService.removeUserFromTeam(
      teamId,
      userId,
      user.id,
    );

    return result;
  }
}
