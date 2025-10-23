import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { TeamUser } from './team-user.model';

@Table({
  tableName: 'teams',
  timestamps: true,
  underscored: true,
})
export class Team extends Model<Team> {
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_owner_id',
  })
  userOwnerId: string;

  @BelongsTo(() => User, 'user_owner_id')
  owner: User;

  @HasMany(() => TeamUser)
  teamUsers: TeamUser[];

  // Relacionamento com projetos será definido no model Project
}

