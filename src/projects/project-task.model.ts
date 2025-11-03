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
import { ProjectSprint } from './project-sprint.model';

export enum TaskStatus {
  FINISHED = 'finished',
  IN_PROGRESS = 'in_progress',
  NOT_STARTED = 'not_started',
}

@Table({
  tableName: 'project_tasks',
  timestamps: true,
  underscored: true,
})
export class ProjectTask extends Model<ProjectTask> {
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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  position: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    field: 'due_date',
  })
  dueDate: Date;

  @Default(TaskStatus.NOT_STARTED)
  @Column({
    type: DataType.ENUM(...Object.values(TaskStatus)),
    allowNull: false,
  })
  status: TaskStatus;

  @ForeignKey(() => ProjectSprint)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'project_sprint_id',
  })
  projectSprintId: string;

  @BelongsTo(() => ProjectSprint)
  projectSprint: ProjectSprint;

  @ForeignKey(() => ProjectTask)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'task_depends_on',
  })
  taskDependsOn?: string;

  @BelongsTo(() => ProjectTask, 'task_depends_on')
  dependsOnTask?: ProjectTask;

  @HasMany(() => ProjectTask, 'task_depends_on')
  dependentTasks?: ProjectTask[];
}

