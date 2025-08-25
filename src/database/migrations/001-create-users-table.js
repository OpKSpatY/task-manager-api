/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        allowNull: false,
      },
      first_name: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
      },
      last_login_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      verification_code: {
        type: Sequelize.DataTypes.STRING(6),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique',
    });

    await queryInterface.addIndex('users', ['verification_code'], {
      name: 'users_verification_code_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};


