import { IsNotEmpty, IsUUID, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserOrganizationPermission } from '../organization-user.model';

export class AddUserToOrganizationDto {
  @ApiProperty({
    description: 'ID do usuário que está fazendo a requisição (quem está adicionando)',
    example: '7b8a4d2f-5b6c-4c8a-9b0f-1a2b3c4d5e6f',
  })
  @IsNotEmpty({ message: 'ID do usuário que está fazendo a requisição é obrigatório' })
  @IsUUID('4', { message: 'ID do usuário deve ser um UUID válido' })
  requestingUserId: string;

  @ApiProperty({
    description: 'ID do usuário a ser adicionado à organização',
    example: '8c9a5d3f-6b7c-5c9a-0c1f-2a3b4c5d6e7f',
  })
  @IsNotEmpty({ message: 'ID do usuário a ser adicionado é obrigatório' })
  @IsUUID('4', { message: 'ID do usuário deve ser um UUID válido' })
  userId: string;

  @ApiProperty({
    description: 'Permissão do usuário na organização',
    enum: UserOrganizationPermission,
    example: UserOrganizationPermission.USER,
    default: UserOrganizationPermission.USER,
  })
  @IsOptional()
  @IsEnum(UserOrganizationPermission, {
    message: 'Permissão deve ser ADMIN ou USER',
  })
  userOrganizationPermission?: UserOrganizationPermission;

  @ApiProperty({
    description: 'Se o usuário pode criar projetos na organização',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'userCanCreateProjects deve ser um valor booleano' })
  userCanCreateProjects?: boolean;
}
