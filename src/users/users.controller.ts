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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
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

