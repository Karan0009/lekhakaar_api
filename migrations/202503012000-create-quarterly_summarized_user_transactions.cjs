'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('quarterly_summarized_user_transactions', {
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
      quarter_start: {
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
      'quarterly_summarized_user_transactions',
      ['user_id', 'sub_category_id', 'quarter_start'],
      {
        unique: true,
        name: 'unique_user_sub_category_quarter_start',
      },
    );
    await queryInterface.addIndex('quarterly_summarized_user_transactions', [
      'user_id',
    ]);
    await queryInterface.addIndex('quarterly_summarized_user_transactions', [
      'sub_category_id',
    ]);
    await queryInterface.addIndex('quarterly_summarized_user_transactions', [
      'quarter_start',
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('quarterly_summarized_user_transactions', [
      'user_id',
    ]);
    await queryInterface.removeIndex('quarterly_summarized_user_transactions', [
      'sub_category_id',
    ]);
    await queryInterface.removeIndex('quarterly_summarized_user_transactions', [
      'quarter_start',
    ]);
    await queryInterface.removeIndex(
      'quarterly_summarized_user_transactions',
      ['user_id', 'sub_category_id', 'quarter_start'],
      {
        unique: true,
        name: 'unique_user_sub_category_quarter_start',
      },
    );
    await queryInterface.dropTable('quarterly_summarized_user_transactions');
  },
};
