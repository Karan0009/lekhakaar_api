'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_transactions', 'sub_cat_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'sub_categories',
        key: 'id',
      },
    });

    await queryInterface.addIndex('user_transactions', ['sub_cat_id']);
    await queryInterface.addIndex('user_transactions', [
      'user_id',
      'sub_cat_id',
    ]);
    await queryInterface.addIndex('user_transactions', [
      'user_id',
      'sub_cat_id',
      'transaction_datetime',
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('user_transactions', [
      'user_id',
      'sub_cat_id',
      'transaction_datetime',
    ]);
    await queryInterface.removeIndex('user_transactions', [
      'user_id',
      'sub_cat_id',
    ]);
    await queryInterface.removeIndex('user_transactions', ['sub_cat_id']);
    await queryInterface.removeColumn('user_transactions', 'sub_cat_id');
  },
};
