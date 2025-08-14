'use strict';

const { QueryInterface, Sequelize } = require('sequelize');

module.exports = {
  /**
   *
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'occupation', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'city', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addIndex('users', ['occupation'], {
      unique: false,
    });

    await queryInterface.addIndex('users', ['city'], {
      unique: false,
    });
  },

  /**
   *
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', ['occupation']);
    await queryInterface.removeIndex('users', ['city']);

    await queryInterface.removeColumn('users', 'name');
    await queryInterface.removeColumn('users', 'occupation');
    await queryInterface.removeColumn('users', 'city');
  },
};
