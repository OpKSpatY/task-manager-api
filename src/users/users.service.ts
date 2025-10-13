import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Verificar se o email já existe
      const existingUser = await this.userModel.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }

      // Criptografar a senha
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Criar o usuário
      const user = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return user.toJSON() as UserResponseDto;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    try{
      const users = await this.userModel.findAll();
      return users.map(user => user.toJSON() as UserResponseDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Não foi possível realizar a requisição.');
    }
  }

  async findOne(id: string): Promise<UserResponseDto> {
    try{
      const user = await this.userModel.findByPk(id);

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      return user.toJSON() as UserResponseDto;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Não foi possível realizar a requisição.');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try{
      return await this.userModel.findOne({
        where: { email },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Não foi possível realizar a requisição.');
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try{
      await this.userModel.update(
        { lastLoginAt: new Date() },
        { where: { id } }
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Não foi possível realizar a requisição.');
    }
  }
}

