'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('monthly_summarized_user_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      sub_category_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'sub_categories',
          key: 'id',
        },
      },
      month_start: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      amount: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex(
      'monthly_summarized_user_transactions',
      ['user_id', 'sub_category_id', 'month_start'],
      {
        unique: true,
        name: 'unique_user_sub_category_month_start',
      },
    );
    await queryInterface.addIndex('monthly_summarized_user_transactions', [
      'user_id',
    ]);
    await queryInterface.addIndex('monthly_summarized_user_transactions', [
      'sub_category_id',
    ]);
    await queryInterface.addIndex('monthly_summarized_user_transactions', [
      'month_start',
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('monthly_summarized_user_transactions', [
      'user_id',
    ]);
    await queryInterface.removeIndex('monthly_summarized_user_transactions', [
      'sub_category_id',
    ]);
    await queryInterface.removeIndex('monthly_summarized_user_transactions', [
      'month_start',
    ]);
    await queryInterface.removeIndex(
      'monthly_summarized_user_transactions',
      ['user_id', 'sub_category_id', 'month_start'],
      {
        unique: true,
        name: 'unique_user_sub_category_month_start',
      },
    );
    await queryInterface.dropTable('monthly_summarized_user_transactions');
  },
};
