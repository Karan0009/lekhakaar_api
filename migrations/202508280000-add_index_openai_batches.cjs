'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('openai_batches', ['status', 'purpose']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('openai_batches', ['status', 'purpose']);
  },
};
