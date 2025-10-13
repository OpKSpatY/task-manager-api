import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  BeforeCreate,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Organization } from './organizations.model';
import { v4 as uuidv4 } from 'uuid';

export enum UserOrganizationPermission {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Table({
  tableName: 'organization_users',
  timestamps: true,
  underscored: true,
})
export class OrganizationUser extends Model<OrganizationUser> {
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId: string;

  @ForeignKey(() => Organization)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'organization_id',
  })
  organizationId: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'user_can_create_projects',
  })
  userCanCreateProjects: boolean;

  @Default(UserOrganizationPermission.USER)
  @Column({
    type: DataType.ENUM(...Object.values(UserOrganizationPermission)),
    allowNull: false,
    field: 'user_organization_permission',
  })
  userOrganizationPermission: UserOrganizationPermission;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Organization)
  organization: Organization;

  // Hook apenas para gerar UUID automaticamente
  @BeforeCreate
  static generateId(instance: OrganizationUser) {
    if (!instance.id) {
      instance.id = uuidv4();
    }
  }
}

