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
import { TaskChecklistsService } from './task-checklists.service';
import { CreateTaskChecklistDto } from './dto/create-task-checklist.dto';
import { UpdateTaskChecklistDto } from './dto/update-task-checklist.dto';
import { TaskChecklistResponseDto } from './dto/task-checklist-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('task-checklists')
@Controller('task-checklists')
export class TaskChecklistsController {
  constructor(private readonly taskChecklistsService: TaskChecklistsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar nova checklist de tarefa',
    description: 'Cria uma nova checklist associada a uma tarefa. O userId deve ser fornecido no corpo da requisição para verificação de permissões.',
  })
  @ApiResponse({
    status: 201,
    description: 'Checklist criada com sucesso',
    type: TaskChecklistResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para criar checklists nesta tarefa ou não tem acesso à organização',
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async create(
    @Body() createTaskChecklistDto: CreateTaskChecklistDto,
  ): Promise<TaskChecklistResponseDto> {
    return this.taskChecklistsService.create(createTaskChecklistDto, createTaskChecklistDto.userId);
  }

  @Get('task/:taskId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todas as checklists de uma tarefa',
    description: 'Retorna todas as checklists associadas a uma tarefa específica. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'taskId',
    description: 'ID único da tarefa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de checklists retornada com sucesso',
    type: [TaskChecklistResponseDto],
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
  async findAllByTask(
    @Param('taskId') taskId: string,
    @Query('userId') userId: string,
  ): Promise<TaskChecklistResponseDto[]> {
    return this.taskChecklistsService.findAll(taskId, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Buscar checklist por ID',
    description: 'Retorna uma checklist específica por ID. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da checklist',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist encontrada com sucesso',
    type: TaskChecklistResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem acesso a esta checklist',
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<TaskChecklistResponseDto> {
    return this.taskChecklistsService.findOne(id, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar checklist',
    description: 'Atualiza uma checklist existente. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da checklist',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Checklist atualizada com sucesso',
    type: TaskChecklistResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para editar esta checklist',
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTaskChecklistDto: UpdateTaskChecklistDto,
    @Query('userId') userId: string,
  ): Promise<TaskChecklistResponseDto> {
    return this.taskChecklistsService.update(id, updateTaskChecklistDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Excluir checklist',
    description: 'Exclui uma checklist e todos os seus itens. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único da checklist',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Checklist excluída com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para excluir esta checklist',
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async remove(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    return this.taskChecklistsService.remove(id, userId);
  }
}


