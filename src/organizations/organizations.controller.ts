import {
  Controller,
  Get,
  Post,
  Put,
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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { AddUserToOrganizationDto } from './dto/add-user-to-organization.dto';
import { UpdateOrganizationUserDto } from './dto/update-organization-user.dto';
import { OrganizationUserResponseDto } from './dto/organization-user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar nova organização',
    description: 'Cria uma nova organização no sistema (requer autenticação)',
  })
  @ApiResponse({
    status: 201,
    description: 'Organização criada com sucesso',
    type: OrganizationResponseDto,
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
    description: 'Nome da organização já está em uso',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao criar organização',
  })
  async create(
    @Body() createOrganizationDto: CreateOrganizationDto,
    @CurrentUser() user: any,
  ): Promise<{
    message: string;
    organization: OrganizationResponseDto;
  }> {
    const organization = await this.organizationsService.create(
      createOrganizationDto,
      user.id,
    );

    return {
      message: 'Organização criada com sucesso',
      organization,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todas as organizações',
    description:
      'Retorna uma lista de todas as organizações cadastradas (requer autenticação)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de organizações retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Organizações listadas com sucesso' },
        organizations: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrganizationResponseDto' },
        },
        count: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao buscar organizações',
  })
  async findAll(): Promise<{
    message: string;
    organizations: OrganizationResponseDto[];
    count: number;
  }> {
    const organizations = await this.organizationsService.findAll();

    return {
      message: 'Organizações listadas com sucesso',
      organizations,
      count: organizations.length,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID da organização a ser atualizada',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  @ApiOperation({
    summary: 'Atualizar organização',
    description: 'Atualiza os dados de uma organização existente (requer autenticação e ser o criador)',
  })
  @ApiResponse({
    status: 200,
    description: 'Organização atualizada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Organização atualizada com sucesso' },
        organization: { type: 'object' },
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
    status: 404,
    description: 'Organização não encontrada',
  })
  @ApiResponse({
    status: 409,
    description: 'Nome da organização já está em uso ou usuário não tem permissão',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao atualizar organização',
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() user: any,
  ): Promise<{
    message: string;
    organization: OrganizationResponseDto;
  }> {
    const organization = await this.organizationsService.update(
      id,
      updateOrganizationDto,
      user.id,
    );

    return {
      message: 'Organização atualizada com sucesso',
      organization,
    };
  }

  // Rota temporária para debug
  @Get(':id/debug/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID da organização',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário para debug',
    example: '7b8a4d2f-5b6c-4c8a-9b0f-1a2b3c4d5e6f',
  })
  @ApiOperation({
    summary: 'Debug - Verificar permissões do usuário',
    description: 'Rota temporária para debug de permissões',
  })
  async debugUserPermission(
    @Param('id') organizationId: string,
    @Param('userId') userId: string,
  ): Promise<any> {
    return await this.organizationsService.debugUserPermission(organizationId, userId);
  }

  // Rota temporária para debug - dados da organização
  @Get(':id/debug-data')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID da organização',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  @ApiOperation({
    summary: 'Debug - Dados da organização',
    description: 'Rota temporária para debug dos dados da organização',
  })
  async debugOrganizationData(
    @Param('id') organizationId: string,
  ): Promise<any> {
    return await this.organizationsService.debugOrganizationData(organizationId);
  }

  // Rotas para gerenciar usuários da organização

  @Post(':id/users')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID da organização',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  @ApiOperation({
    summary: 'Adicionar usuário à organização',
    description: 'Adiciona um usuário a uma organização. O requestingUserId deve ser o ID do usuário que tem permissão para adicionar usuários (admin ou criador da organização)',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário adicionado à organização com sucesso',
    type: OrganizationUserResponseDto,
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
    description: 'Usuário não tem permissão para adicionar usuários',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização ou usuário não encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Usuário já faz parte desta organização',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao adicionar usuário',
  })
  async addUserToOrganization(
    @Param('id') organizationId: string,
    @Body() addUserDto: AddUserToOrganizationDto,
    @CurrentUser() user: any,
  ): Promise<{
    message: string;
    organizationUser: OrganizationUserResponseDto;
  }> {
    const organizationUser = await this.organizationsService.addUserToOrganization(
      organizationId,
      addUserDto,
      user.id,
    );

    return {
      message: 'Usuário adicionado à organização com sucesso',
      organizationUser,
    };
  }

  @Delete(':id/users/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID da organização',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário a ser removido',
    example: '7b8a4d2f-5b6c-4c8a-9b0f-1a2b3c4d5e6f',
  })
  @ApiOperation({
    summary: 'Remover usuário da organização',
    description: 'Remove um usuário de uma organização (requer autenticação e permissão de admin ou ser o próprio usuário)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário removido da organização com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuário removido da organização com sucesso' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Tentativa de remover o criador da organização',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para remover este usuário',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização ou usuário não encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao remover usuário',
  })
  async removeUserFromOrganization(
    @Param('id') organizationId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    return await this.organizationsService.removeUserFromOrganization(
      organizationId,
      userId,
      user.id,
    );
  }

  @Put(':id/users/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID da organização',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário a ser atualizado',
    example: '7b8a4d2f-5b6c-4c8a-9b0f-1a2b3c4d5e6f',
  })
  @ApiOperation({
    summary: 'Atualizar usuário da organização',
    description: 'Atualiza as permissões de um usuário em uma organização (requer autenticação e permissão de admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuário atualizado com sucesso' },
        organizationUser: { $ref: '#/components/schemas/OrganizationUserResponseDto' },
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
    description: 'Usuário não tem permissão para atualizar este usuário',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização ou usuário não encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao atualizar usuário',
  })
  async updateOrganizationUser(
    @Param('id') organizationId: string,
    @Param('userId') userId: string,
    @Body() updateDto: UpdateOrganizationUserDto,
    @CurrentUser() user: any,
  ): Promise<{
    message: string;
    organizationUser: OrganizationUserResponseDto;
  }> {
    const organizationUser = await this.organizationsService.updateOrganizationUser(
      organizationId,
      userId,
      updateDto,
      user.id,
    );

    return {
      message: 'Usuário atualizado com sucesso',
      organizationUser,
    };
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID da organização',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  @ApiOperation({
    summary: 'Listar usuários da organização',
    description: 'Lista todos os usuários de uma organização (requer autenticação e acesso à organização)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuários listados com sucesso' },
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrganizationUserResponseDto' },
        },
        count: { type: 'number', example: 3 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem acesso a esta organização',
  })
  @ApiResponse({
    status: 404,
    description: 'Organização não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno ao buscar usuários',
  })
  async getOrganizationUsers(
    @Param('id') organizationId: string,
    @CurrentUser() user: any,
  ): Promise<{
    message: string;
    users: OrganizationUserResponseDto[];
    count: number;
  }> {
    const users = await this.organizationsService.getOrganizationUsers(
      organizationId,
      user.id,
    );

    return {
      message: 'Usuários listados com sucesso',
      users,
      count: users.length,
    };
  }
}
