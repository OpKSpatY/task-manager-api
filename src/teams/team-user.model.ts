import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { Team } from './team.model';

@Table({
  tableName: 'team_users',
  timestamps: true,
  underscored: true,
})
export class TeamUser extends Model<TeamUser> {
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

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId: string;

  @ForeignKey(() => Team)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'team_id',
  })
  teamId: string;

  @BelongsTo(() => User, 'user_id')
  user: User;

  @BelongsTo(() => Team, 'team_id')
  team: Team;
}

