'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('project_sprints', {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        allowNull: false,
      },
      name: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
      },
      project_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      begin_at: {
        type: Sequelize.DataTypes.DATEONLY,
        allowNull: false,
      },
      due_at: {
        type: Sequelize.DataTypes.DATEONLY,
        allowNull: false,
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

    // Adicionar índices para melhorar performance
    await queryInterface.addIndex('project_sprints', ['project_id'], {
      name: 'idx_project_sprints_project_id',
    });

    await queryInterface.addIndex('project_sprints', ['begin_at'], {
      name: 'idx_project_sprints_begin_at',
    });

    await queryInterface.addIndex('project_sprints', ['due_at'], {
      name: 'idx_project_sprints_due_at',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('project_sprints');
  },
};

