import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

export default class SubmittedTest extends Model {}

SubmittedTest.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    test_series_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    test_series_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'SubmittedTest',
    tableName: 'submitted_tests',
  },
);
