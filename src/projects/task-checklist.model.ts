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
import { ProjectTask } from './project-task.model';
import { TaskChecklistItem } from './task-checklist-item.model';

@Table({
  tableName: 'tasks_checklist',
  timestamps: true,
  underscored: true,
})
export class TaskChecklist extends Model<TaskChecklist> {
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

  @ForeignKey(() => ProjectTask)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'project_tasks_id',
  })
  projectTasksId: string;

  @BelongsTo(() => ProjectTask)
  projectTask: ProjectTask;

  @HasMany(() => TaskChecklistItem)
  items: TaskChecklistItem[];
}


