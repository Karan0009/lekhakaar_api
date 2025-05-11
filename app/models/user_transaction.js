import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const USER_TRANSACTION_STATUSES = {
  EXTRACTED: 'EXTRACTED',
  DELETED: 'DELETED',
};

const CREATION_SOURCE = {
  wa_service: 'wa_service',
  app: 'app',
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
      // todo: sub_cat_id should never be null,
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
    creation_source: {
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
    scopes: {
      active: {
        where: {
          status: USER_TRANSACTION_STATUSES.EXTRACTED,
        },
      },
    },

    hooks: {
      beforeDestroy: async (instance, options) => {
        instance.status = USER_TRANSACTION_STATUSES.DELETED;
        await instance.save({ transaction: options.transaction });
      },
    },
  },
);

export { USER_TRANSACTION_STATUSES, CREATION_SOURCE };
