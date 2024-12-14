'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'test_series_questions',
      'weekly_test_series_id',
      {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'test_series_questions',
      'weekly_test_series_id',
    );
  },
};
