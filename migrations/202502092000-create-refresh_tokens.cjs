'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.STRING(26), // ULID is stored as a string
        primaryKey: true,
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      expiry_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('refresh_tokens', ['user_id', 'status']);
    await queryInterface.addIndex('refresh_tokens', ['token', 'status']);
    await queryInterface.addIndex('refresh_tokens', ['expiry_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('refresh_tokens', ['user_id', 'status']);
    await queryInterface.removeIndex('refresh_tokens', ['token', 'status']);
    await queryInterface.removeIndex('refresh_tokens', ['expiry_at']);
    await queryInterface.dropTable('refresh_tokens');
  },
};
