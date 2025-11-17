import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { TaskChecklist } from './task-checklist.model';

@Table({
  tableName: 'tasks_checklist_items',
  timestamps: true,
  underscored: true,
})
export class TaskChecklistItem extends Model<TaskChecklistItem> {
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'item_description',
  })
  itemDescription: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'is_completed',
  })
  isCompleted: boolean;

  @ForeignKey(() => TaskChecklist)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'tasks_checklist_id',
  })
  tasksChecklistId: string;

  @BelongsTo(() => TaskChecklist)
  taskChecklist: TaskChecklist;
}


