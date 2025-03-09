'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('user_transactions', 'amount', {
      type: Sequelize.BIGINT,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('user_transactions', 'amount', {
      type: Sequelize.DOUBLE,
      allowNull: false,
    });
  },
};
