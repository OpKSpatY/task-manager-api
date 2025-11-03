'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('project_tasks', 'task_depends_on', {
      type: Sequelize.DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'project_tasks',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Adicionar índice para melhorar performance
    await queryInterface.addIndex('project_tasks', ['task_depends_on'], {
      name: 'idx_project_tasks_task_depends_on',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('project_tasks', 'idx_project_tasks_task_depends_on');
    await queryInterface.removeColumn('project_tasks', 'task_depends_on');
  },
};

