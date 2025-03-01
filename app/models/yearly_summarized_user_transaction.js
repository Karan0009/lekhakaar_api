import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

export default class YearlySummarizedUserTransaction extends Model {}

YearlySummarizedUserTransaction.init(
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
        model: User,
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
    year_start: {
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
    modelName: 'YearlySummarizedUserTransaction',
    tableName: 'yearly_summarized_user_transactions',
  },
);
