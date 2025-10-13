import { IsNotEmpty, IsUUID, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserOrganizationPermission } from '../organization-user.model';

export class UpdateOrganizationUserDto {
  @ApiProperty({
    description: 'Permissão do usuário na organização',
    enum: UserOrganizationPermission,
    example: UserOrganizationPermission.ADMIN,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserOrganizationPermission, {
    message: 'Permissão deve ser ADMIN ou USER',
  })
  userOrganizationPermission?: UserOrganizationPermission;

  @ApiProperty({
    description: 'Se o usuário pode criar projetos na organização',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'userCanCreateProjects deve ser um valor booleano' })
  userCanCreateProjects?: boolean;
}

