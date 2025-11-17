'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks_checklist_items', {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        allowNull: false,
      },
      item_description: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
      },
      is_completed: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      tasks_checklist_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tasks_checklist',
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
    await queryInterface.addIndex('tasks_checklist_items', ['tasks_checklist_id'], {
      name: 'idx_tasks_checklist_items_tasks_checklist_id',
    });

    await queryInterface.addIndex('tasks_checklist_items', ['is_completed'], {
      name: 'idx_tasks_checklist_items_is_completed',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tasks_checklist_items');
  },
};


