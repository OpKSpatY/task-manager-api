import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BeforeCreate,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'first_name',
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'last_name',
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'last_login_at',
  })
  declare lastLoginAt: Date;

  @Column({
    type: DataType.STRING(6),
    allowNull: true,
    field: 'verification_code',
  })
  declare verificationCode: string;

  // Remover estas definições explícitas - o Sequelize as gerencia automaticamente
  // declare createdAt: Date;
  // declare updatedAt: Date;

  // Hook apenas para gerar UUID automaticamente
  @BeforeCreate
  static generateId(instance: User) {
    if (!instance.id) {
      instance.id = uuidv4();
    }
  }

  // Método para obter o nome completo
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Método para ocultar senha em respostas JSON
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.verificationCode;
    return values;
  }
}
