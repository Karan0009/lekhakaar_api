'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('weekly_summarized_user_transactions', {
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
        allowNull: false,
        references: {
          model: 'sub_categories',
          key: 'id',
        },
      },
      week_start: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      amount: {
        type: Sequelize.BIGINT,
        allowNull: false,
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

    await queryInterface.addIndex(
      'weekly_summarized_user_transactions',
      ['user_id', 'sub_category_id', 'week_start'],
      {
        unique: true,
        name: 'unique_user_sub_category_week_start',
      },
    );
    await queryInterface.addIndex('weekly_summarized_user_transactions', [
      'user_id',
    ]);
    await queryInterface.addIndex('weekly_summarized_user_transactions', [
      'sub_category_id',
    ]);
    await queryInterface.addIndex('weekly_summarized_user_transactions', [
      'week_start',
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('weekly_summarized_user_transactions', [
      'user_id',
    ]);
    await queryInterface.removeIndex('weekly_summarized_user_transactions', [
      'sub_category_id',
    ]);
    await queryInterface.removeIndex('weekly_summarized_user_transactions', [
      'week_start',
    ]);
    await queryInterface.removeIndex(
      'weekly_summarized_user_transactions',
      ['user_id', 'sub_category_id', 'week_start'],
      {
        unique: true,
        name: 'unique_user_sub_category_week_start',
      },
    );
    await queryInterface.dropTable('weekly_summarized_user_transactions');
  },
};
