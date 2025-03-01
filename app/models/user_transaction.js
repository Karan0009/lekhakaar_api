import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const USER_TRANSACTION_STATUSES = {
  EXTRACTED: 'EXTRACTED',
  DELETED: 'DELETED',
};

export default class UserTransaction extends Model {}

UserTransaction.init(
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
    sub_cat_id: {
      type: DataTypes.BIGINT,
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
    meta: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UserTransaction',
    tableName: 'user_transactions',
    paranoid: true,
    deletedAt: 'deleted_at',
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
  },
);

export { USER_TRANSACTION_STATUSES };
