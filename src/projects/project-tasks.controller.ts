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
import { ProjectTasksService } from './project-tasks.service';
import { CreateProjectTaskDto } from './dto/create-project-task.dto';
import { UpdateProjectTaskDto } from './dto/update-project-task.dto';
import { ProjectTaskResponseDto } from './dto/project-task-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('project-tasks')
@Controller('project-tasks')
export class ProjectTasksController {
  constructor(private readonly projectTasksService: ProjectTasksService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar nova tarefa de projeto',
    description: 'Cria uma nova tarefa em uma sprint. A posição da tarefa é calculada automaticamente (maior posição existente + 1). A data de vencimento da tarefa deve estar dentro do intervalo da sprint. O userId deve ser fornecido no corpo da requisição para verificação de permissões.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada com sucesso',
    type: ProjectTaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos ou data de vencimento fora do intervalo da sprint',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para criar tarefas neste projeto ou não tem acesso à organização',
  })
  @ApiResponse({
    status: 404,
    description: 'Sprint não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async create(
    @Body() createProjectTaskDto: CreateProjectTaskDto,
  ): Promise<ProjectTaskResponseDto> {
    return this.projectTasksService.create(createProjectTaskDto, createProjectTaskDto.userId);
  }

  @Get('sprint/:sprintId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todas as tarefas de uma sprint',
    description: 'Retorna todas as tarefas de uma sprint específica, ordenadas por posição e data de criação. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'ID único da sprint',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tarefas retornada com sucesso',
    type: [ProjectTaskResponseDto],
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
  async findAllBySprint(
    @Param('sprintId') sprintId: string,
    @Query('userId') userId: string,
  ): Promise<ProjectTaskResponseDto[]> {
    return this.projectTasksService.findAll(sprintId, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Buscar tarefa por ID',
    description: 'Retorna uma tarefa específica por ID. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da tarefa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarefa encontrada com sucesso',
    type: ProjectTaskResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem acesso a esta tarefa',
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<ProjectTaskResponseDto> {
    return this.projectTasksService.findOne(id, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar tarefa',
    description: 'Atualiza uma tarefa existente. Se a data de vencimento for alterada, ela deve estar dentro do intervalo da sprint. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da tarefa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Tarefa atualizada com sucesso',
    type: ProjectTaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos ou data de vencimento fora do intervalo da sprint',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para editar esta tarefa',
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectTaskDto: UpdateProjectTaskDto,
    @Query('userId') userId: string,
  ): Promise<ProjectTaskResponseDto> {
    return this.projectTasksService.update(id, updateProjectTaskDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Excluir tarefa',
    description: 'Exclui uma tarefa. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da tarefa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Tarefa excluída com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para excluir esta tarefa',
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async remove(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    return this.projectTasksService.remove(id, userId);
  }
}

