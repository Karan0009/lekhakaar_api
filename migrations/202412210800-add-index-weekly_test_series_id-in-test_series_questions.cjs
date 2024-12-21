'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('test_series_questions', [
      'weekly_test_series_id',
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('test_series_questions', [
      'weekly_test_series_id',
    ]);
  },
};
