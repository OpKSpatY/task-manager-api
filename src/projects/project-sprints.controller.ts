import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { ProjectSprintsService } from './project-sprints.service';
import { CreateProjectSprintDto } from './dto/create-project-sprint.dto';
import { UpdateProjectSprintDto } from './dto/update-project-sprint.dto';
import { ProjectSprintResponseDto } from './dto/project-sprint-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('project-sprints')
@Controller('project-sprints')
export class ProjectSprintsController {
  constructor(private readonly projectSprintsService: ProjectSprintsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar nova sprint de projeto',
    description: 'Cria uma nova sprint em um projeto. O userId deve ser fornecido no corpo da requisição para verificação de permissões.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sprint criada com sucesso',
    type: ProjectSprintResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos ou data de início posterior à data de término',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para criar sprints neste projeto ou não tem acesso à organização',
  })
  @ApiResponse({
    status: 404,
    description: 'Projeto não encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async create(
    @Body() createProjectSprintDto: CreateProjectSprintDto,
  ): Promise<ProjectSprintResponseDto> {
    return this.projectSprintsService.create(createProjectSprintDto, createProjectSprintDto.userId);
  }

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todas as sprints de um projeto',
    description: 'Retorna todas as sprints de um projeto específico. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'ID único do projeto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sprints retornada com sucesso',
    type: [ProjectSprintResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem acesso a este projeto',
  })
  @ApiResponse({
    status: 404,
    description: 'Projeto não encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async findAllByProject(
    @Param('projectId') projectId: string,
    @Query('userId') userId: string,
  ): Promise<ProjectSprintResponseDto[]> {
    return this.projectSprintsService.findAll(projectId, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Buscar sprint por ID',
    description: 'Retorna uma sprint específica por ID. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sprint encontrada com sucesso',
    type: ProjectSprintResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem acesso a esta sprint',
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<ProjectSprintResponseDto> {
    return this.projectSprintsService.findOne(id, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar sprint',
    description: 'Atualiza uma sprint existente. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Sprint atualizada com sucesso',
    type: ProjectSprintResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos ou data de início posterior à data de término',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para editar esta sprint',
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectSprintDto: UpdateProjectSprintDto,
    @Query('userId') userId: string,
  ): Promise<ProjectSprintResponseDto> {
    return this.projectSprintsService.update(id, updateProjectSprintDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Excluir sprint',
    description: 'Exclui uma sprint. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Sprint excluída com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para excluir esta sprint',
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async remove(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    return this.projectSprintsService.remove(id, userId);
  }
}

