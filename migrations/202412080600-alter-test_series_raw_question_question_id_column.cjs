'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'test_series_raw_questions',
      'test_series_question_id',
      {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
    );
    await queryInterface.removeColumn(
      'test_series_raw_questions',
      'question_id',
    );

    await queryInterface.renameColumn(
      'test_series_raw_questions',
      'test_series_question_id',
      'question_id',
    );
  },

  async down(queryInterface) {
    await queryInterface.addColumn('test_series_raw_questions', 'question_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.removeColumn(
      'test_series_raw_questions',
      'test_series_question_id',
    );
  },
};
