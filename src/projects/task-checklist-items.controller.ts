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
import { TaskChecklistItemsService } from './task-checklist-items.service';
import { CreateTaskChecklistItemDto } from './dto/create-task-checklist-item.dto';
import { UpdateTaskChecklistItemDto } from './dto/update-task-checklist-item.dto';
import { TaskChecklistItemResponseDto } from './dto/task-checklist-item-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('task-checklist-items')
@Controller('task-checklist-items')
export class TaskChecklistItemsController {
  constructor(private readonly taskChecklistItemsService: TaskChecklistItemsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar novo item de checklist',
    description: 'Cria um novo item em uma checklist. O userId deve ser fornecido no corpo da requisição para verificação de permissões.',
  })
  @ApiResponse({
    status: 201,
    description: 'Item criado com sucesso',
    type: TaskChecklistItemResponseDto,
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
    description: 'Usuário não tem permissão para criar itens nesta checklist ou não tem acesso à organização',
  })
  @ApiResponse({
    status: 404,
    description: 'Checklist não encontrada',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async create(
    @Body() createTaskChecklistItemDto: CreateTaskChecklistItemDto,
  ): Promise<TaskChecklistItemResponseDto> {
    return this.taskChecklistItemsService.create(createTaskChecklistItemDto, createTaskChecklistItemDto.userId);
  }

  @Get('checklist/:checklistId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todos os itens de uma checklist',
    description: 'Retorna todos os itens de uma checklist específica, ordenados por data de criação. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'checklistId',
    description: 'ID único da checklist',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de itens retornada com sucesso',
    type: [TaskChecklistItemResponseDto],
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
  async findAllByChecklist(
    @Param('checklistId') checklistId: string,
    @Query('userId') userId: string,
  ): Promise<TaskChecklistItemResponseDto[]> {
    return this.taskChecklistItemsService.findAll(checklistId, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Buscar item de checklist por ID',
    description: 'Retorna um item específico por ID. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do item',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Item encontrado com sucesso',
    type: TaskChecklistItemResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem acesso a este item',
  })
  @ApiResponse({
    status: 404,
    description: 'Item não encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<TaskChecklistItemResponseDto> {
    return this.taskChecklistItemsService.findOne(id, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar item de checklist',
    description: 'Atualiza um item existente. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do item',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Item atualizado com sucesso',
    type: TaskChecklistItemResponseDto,
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
    description: 'Usuário não tem permissão para editar este item',
  })
  @ApiResponse({
    status: 404,
    description: 'Item não encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTaskChecklistItemDto: UpdateTaskChecklistItemDto,
    @Query('userId') userId: string,
  ): Promise<TaskChecklistItemResponseDto> {
    return this.taskChecklistItemsService.update(id, updateTaskChecklistItemDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Excluir item de checklist',
    description: 'Exclui um item de checklist. O userId deve ser fornecido como parâmetro de query.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do item',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Item excluído com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário não tem permissão para excluir este item',
  })
  @ApiResponse({
    status: 404,
    description: 'Item não encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
  })
  async remove(
    @Param('id') id: string,
    @Query('userId') userId: string,
  ): Promise<void> {
    return this.taskChecklistItemsService.remove(id, userId);
  }
}


