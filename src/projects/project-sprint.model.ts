import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { Project } from './project.model';

@Table({
  tableName: 'project_sprints',
  timestamps: true,
  underscored: true,
})
export class ProjectSprint extends Model<ProjectSprint> {
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

  @ForeignKey(() => Project)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'project_id',
  })
  projectId: string;

  @BelongsTo(() => Project)
  project: Project;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    field: 'begin_at',
  })
  beginAt: Date;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    field: 'due_at',
  })
  dueAt: Date;
}

