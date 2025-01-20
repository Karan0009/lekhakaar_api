'use strict';

const { QueryInterface } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('openai_batches', 'purpose', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('openai_batches', 'purpose', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
