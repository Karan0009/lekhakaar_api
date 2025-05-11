'use strict';

const { QueryInterface, Sequelize } = require('sequelize');

module.exports = {
  /**
   *
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    const sqlTransaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.addColumn(
        'user_transactions',
        'creation_source',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        {
          transaction: sqlTransaction,
        },
      );

      await queryInterface.sequelize.query(
        `
        update user_transactions 
        set creation_source = 'wa_service' 
        where creation_source is null;
      `,
        {
          transaction: sqlTransaction,
        },
      );

      await queryInterface.changeColumn(
        'user_transactions',
        'creation_source',
        {
          type: Sequelize.STRING,
          allowNull: false,
        },
        {
          transaction: sqlTransaction,
        },
      );
      await sqlTransaction.commit();
    } catch (error) {
      await sqlTransaction.rollback();
    }
  },

  /**
   *
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_transactions', 'creation_source');
  },
};
