'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_transactions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      transaction_datetime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      recipient_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      meta: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('user_transactions', ['user_id']);
    await queryInterface.addIndex('user_transactions', ['category_id']);
    await queryInterface.addIndex('user_transactions', [
      'user_id',
      'category_id',
    ]);
    await queryInterface.addIndex('user_transactions', [
      'user_id',
      'transaction_datetime',
    ]);
    await queryInterface.addIndex('user_transactions', [
      'user_id',
      'category_id',
      'transaction_datetime',
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('user_transactions', ['user_id']);
    await queryInterface.removeIndex('user_transactions', ['category_id']);
    await queryInterface.removeIndex('user_transactions', [
      'user_id',
      'category_id',
    ]);
    await queryInterface.removeIndex('user_transactions', [
      'user_id',
      'transaction_datetime',
    ]);
    await queryInterface.removeIndex('user_transactions', [
      'user_id',
      'category_id',
      'transaction_datetime',
    ]);
    await queryInterface.dropTable('user_transactions');
  },
};
