import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const TEST_SERIES_QUESTION_STATUSES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PROCESSED: 'PROCESSED',
};

export default class TestSeriesQuestion extends Model {}

TestSeriesQuestion.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: TEST_SERIES_QUESTION_STATUSES.PENDING,
    },
    question_added_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'TestSeriesQuestion',
    tableName: 'test_series_questions',
  },
);

export { TEST_SERIES_QUESTION_STATUSES };
