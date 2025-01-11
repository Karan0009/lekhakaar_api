'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('raw_transactions', 'extracted_text', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addIndex('raw_transactions', ['extracted_text']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('raw_transactions', ['extracted_text']);
    await queryInterface.removeColumn('raw_transactions', 'extracted_text');
  },
};
