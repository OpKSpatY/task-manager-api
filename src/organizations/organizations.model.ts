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

@Table({
  tableName: 'organizations',
  timestamps: true,
  underscored: true,
})
export class Organization extends Model<Organization> {
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
    field: 'organization_creator',
  })
  organizationCreator: string;

  @BelongsTo(() => User)
  creator: User;

  // Relacionamento com projetos será definido no model Project
}
