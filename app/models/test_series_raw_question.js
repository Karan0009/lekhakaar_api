import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const TEST_SERIES_RAW_QUESTION_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PROCESSED: 'PROCESSED',
};

export default class TestSeriesRawQuestion extends Model {}

TestSeriesRawQuestion.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    raw_question_data: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    question_id: {
      type: DataTypes.UUID,
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
      defaultValue: TEST_SERIES_RAW_QUESTION_STATUSES.PENDING,
    },
  },
  {
    sequelize,
    modelName: 'TestSeriesRawQuestion',
    tableName: 'test_series_raw_questions',
  },
);

export { TEST_SERIES_RAW_QUESTION_STATUSES };
