'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('test_series_questions', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      question: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      meta: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
      },
      question_added_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add index for question_added_date
    await queryInterface.addIndex('test_series_questions', [
      'question_added_date',
    ]);

    // Add index for status
    await queryInterface.addIndex('test_series_questions', ['status']);
  },

  async down(queryInterface) {
    // Remove indexes
    await queryInterface.removeIndex('test_series_questions', [
      'question_added_date',
    ]);
    await queryInterface.removeIndex('test_series_questions', ['status']);

    // Drop the table
    await queryInterface.dropTable('test_series_questions');
  },
};
