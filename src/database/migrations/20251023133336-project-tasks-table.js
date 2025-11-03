'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('project_tasks', {
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
      description: {
        type: Sequelize.DataTypes.TEXT('tiny'),
        allowNull: true,
      },
      position: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: Sequelize.DataTypes.ENUM('finished', 'in_progress', 'not_started'),
        allowNull: false,
        defaultValue: 'not_started',
      },
      project_sprint_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'project_sprints',
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
    await queryInterface.addIndex('project_tasks', ['project_sprint_id'], {
      name: 'idx_project_tasks_project_sprint_id',
    });

    await queryInterface.addIndex('project_tasks', ['status'], {
      name: 'idx_project_tasks_status',
    });

    await queryInterface.addIndex('project_tasks', ['due_date'], {
      name: 'idx_project_tasks_due_date',
    });

    await queryInterface.addIndex('project_tasks', ['position'], {
      name: 'idx_project_tasks_position',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('project_tasks');
  },
};

