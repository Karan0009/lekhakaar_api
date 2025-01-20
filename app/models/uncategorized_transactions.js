import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

export default class UncategorizedTransaction extends Model {}

UncategorizedTransaction.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    categorized_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UncategorizedTransaction',
    tableName: 'uncategorized_transactions',
  },
);
