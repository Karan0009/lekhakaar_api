import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

export default class Transaction extends Model {}

Transaction.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    transaction_datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    recipient_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
  },
);

// Transaction.belongsTo(User, {
//   foreignKey: 'user_id',
// });
