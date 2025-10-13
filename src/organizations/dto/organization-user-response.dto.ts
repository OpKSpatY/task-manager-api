import { ApiProperty } from '@nestjs/swagger';
import { UserOrganizationPermission } from '../organization-user.model';

export class OrganizationUserResponseDto {
  @ApiProperty({
    description: 'ID único da relação usuário-organização',
    example: 'a3f1a3d4-ef8e-41e6-b61c-1e3c9c5b9f4a',
  })
  id: string;

  @ApiProperty({
    description: 'ID do usuário',
    example: '7b8a4d2f-5b6c-4c8a-9b0f-1a2b3c4d5e6f',
  })
  userId: string;

  @ApiProperty({
    description: 'ID da organização',
    example: '8c9a5d3f-6b7c-5c9a-0c1f-2a3b4c5d6e7f',
  })
  organizationId: string;

  @ApiProperty({
    description: 'Se o usuário pode criar projetos na organização',
    example: true,
  })
  userCanCreateProjects: boolean;

  @ApiProperty({
    description: 'Permissão do usuário na organização',
    enum: UserOrganizationPermission,
    example: UserOrganizationPermission.ADMIN,
  })
  userOrganizationPermission: UserOrganizationPermission;

  @ApiProperty({
    description: 'Data de criação',
    example: '2025-10-13T14:19:08.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2025-10-13T16:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Dados do usuário',
    required: false,
  })
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  };

  @ApiProperty({
    description: 'Dados da organização',
    required: false,
  })
  organization?: {
    id: string;
    name: string;
    description?: string;
  };
}

