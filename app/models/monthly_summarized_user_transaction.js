import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

export default class MonthlySummarizedUserTransaction extends Model {}

MonthlySummarizedUserTransaction.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    sub_category_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'sub_categories',
        key: 'id',
      },
    },
    month_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'MonthlySummarizedUserTransaction',
    tableName: 'monthly_summarized_user_transactions',
  },
);
