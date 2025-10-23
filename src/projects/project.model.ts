import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { Organization } from '../organizations/organizations.model';
import { Team } from '../teams/team.model';

@Table({
  tableName: 'projects',
  timestamps: true,
  underscored: true,
})
export class Project extends Model<Project> {
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
    type: DataType.TEXT('tiny'),
    allowNull: true,
  })
  description?: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'is_project_visible',
  })
  isProjectVisible: boolean;

  @ForeignKey(() => Organization)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'organization_id',
  })
  organizationId: string;

  @BelongsTo(() => Organization)
  organization: Organization;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'due_time',
  })
  dueTime?: Date;

  @ForeignKey(() => Team)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'team_assignment_id',
  })
  teamAssignmentId?: string;

  @BelongsTo(() => Team)
  teamAssignment: Team;
}
