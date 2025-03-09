'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sub_categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id',
        },
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('sub_categories', ['category_id']);
    await queryInterface.addIndex('sub_categories', ['user_id']);
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('sub_categories', 'category_id');
    await queryInterface.removeIndex('sub_categories', 'user_id');
    await queryInterface.dropTable('sub_categories');
  },
};
