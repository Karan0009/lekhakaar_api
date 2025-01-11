'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'raw_transactions'
      );`,
    );

    if (!tableExists[0][0].exists) {
      await queryInterface.createTable('raw_transactions', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        raw_transaction_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        raw_transaction_data: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        remark: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        meta: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'PENDING',
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
    }

    await queryInterface.addIndex('raw_transactions', ['user_id']);
    await queryInterface.addIndex('raw_transactions', ['status']);
    await queryInterface.addIndex('raw_transactions', ['raw_transaction_type']);
    await queryInterface.addIndex('raw_transactions', ['transaction_id']);
    await queryInterface.addIndex('raw_transactions', [
      'raw_transaction_type',
      'status',
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('raw_transactions', [
      'raw_transaction_type',
      'status',
    ]);
    await queryInterface.removeIndex('raw_transactions', ['transaction_id']);
    await queryInterface.removeIndex('raw_transactions', [
      'raw_transaction_type',
    ]);
    await queryInterface.removeIndex('raw_transactions', ['status']);
    await queryInterface.removeIndex('raw_transactions', ['user_id']);
    await queryInterface.dropTable('raw_transactions');
  },
};
