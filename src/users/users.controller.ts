import {
  Controller,
  Get,
  Post,
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
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: 'Cria uma nova conta de usuário no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Email já está em uso',
  })
  @ApiResponse({
    status: 500,
    description: 'Não foi possivel realizar a requisição',
  })
  async register(@Body() createUserDto: CreateUserDto): Promise<{
    message: string;
    user: UserResponseDto;
  }> {
    const user = await this.usersService.create(createUserDto);

    return {
      message: 'Usuário criado com sucesso',
      user,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna uma lista de todos os usuários cadastrados (requer autenticação)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuários listados com sucesso' },
        users: { type: 'array', items: { $ref: '#/components/schemas/UserResponseDto' } },
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
    description: 'Não foi possivel realizar a requisição',
  })
  async findAll(): Promise<{
    message: string;
    users: UserResponseDto[];
    count: number;
  }> {
    const users = await this.usersService.findAll();

    return {
      message: 'Usuários listados com sucesso',
      users,
      count: users.length,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description: 'Retorna os dados de um usuário específico pelo ID (requer autenticação)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário',
    example: '66118f12-f91b-437b-92c6-d3e493a918ca',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Usuário encontrado com sucesso' },
        user: { $ref: '#/components/schemas/UserResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Não foi possivel realizar a requisição',
  })
  async findOne(@Param('id') id: string): Promise<{
    message: string;
    user: UserResponseDto;
  }> {
    const user = await this.usersService.findOne(id);

    return {
      message: 'Usuário encontrado com sucesso',
      user,
    };
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter meu perfil',
    description: 'Retorna os dados do usuário autenticado (requer autenticação)',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Seu perfil' },
        user: { $ref: '#/components/schemas/UserResponseDto' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 500,
    description: 'Não foi possivel realizar a requisição',
  })
  async getMyProfile(@CurrentUser() currentUser: any): Promise<{
    message: string;
    user: UserResponseDto;
  }> {
    const user = await this.usersService.findOne(currentUser.id);

    return {
      message: 'Seu perfil',
      user,
    };
  }
}

