import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const RAW_TRANSACTION_STATUSES = {
  PENDING_TEXT_EXTRACTION: 'PENDING_TEXT_EXTRACTION',
  EXTRACTING_TEXT: 'EXTRACTING_TEXT',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED',
  INVALID: 'INVALID',
};

const RAW_TRANSACTION_TYPE = {
  WA_IMAGE: 'WA_IMAGE',
  WA_TEXT: 'WA_TEXT',
  SMS_READ: 'SMS_READ',
};

export default class RawTransaction extends Model {}

RawTransaction.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    raw_transaction_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    raw_transaction_data: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    extracted_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transaction_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: RAW_TRANSACTION_STATUSES.PENDING,
    },
  },
  {
    sequelize,
    modelName: 'RawTransaction',
    tableName: 'raw_transactions',
  },
);

export { RAW_TRANSACTION_STATUSES, RAW_TRANSACTION_TYPE };
