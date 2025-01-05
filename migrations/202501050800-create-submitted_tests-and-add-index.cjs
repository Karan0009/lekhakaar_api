'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('submitted_tests', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      test_series_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      test_series_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('submitted_tests', ['test_series_id']);
    await queryInterface.addIndex('submitted_tests', ['test_series_name']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('submitted_tests', ['test_series_id']);
    await queryInterface.removeIndex('submitted_tests', ['test_series_name']);
    await queryInterface.dropTable('submitted_tests');
  },
};
