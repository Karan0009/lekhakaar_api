'use strict';

const { QueryInterface, Sequelize } = require('sequelize');

module.exports = {
  /**
   *
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('categories', 'icon', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  /**
   *
   * @param {QueryInterface} queryInterface
   * @param {Sequelize} Sequelize
   */
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('categories', 'icon');
  },
};
