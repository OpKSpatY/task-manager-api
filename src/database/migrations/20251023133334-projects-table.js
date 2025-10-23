'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('projects', {
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
      is_project_visible: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      organization_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'organizations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      due_time: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      team_assignment_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'teams',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.addIndex('projects', ['organization_id'], {
      name: 'idx_projects_organization_id',
    });

    await queryInterface.addIndex('projects', ['team_assignment_id'], {
      name: 'idx_projects_team_assignment_id',
    });

    await queryInterface.addIndex('projects', ['is_project_visible'], {
      name: 'idx_projects_visibility',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('projects');
  },
};
