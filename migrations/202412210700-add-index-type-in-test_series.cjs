'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('test_series', ['type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('test_series', ['type']);
  },
};
