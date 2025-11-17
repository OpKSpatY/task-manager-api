'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks_checklist', {
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
      project_tasks_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'project_tasks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.addIndex('tasks_checklist', ['project_tasks_id'], {
      name: 'idx_tasks_checklist_project_tasks_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tasks_checklist');
  },
};


