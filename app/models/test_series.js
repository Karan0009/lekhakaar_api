import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const TEST_SERIES_TYPES = {
  WEEKLY: 'WEEKLY',
  OTHER: 'OTHER',
};

export default class TestSeries extends Model {}

TestSeries.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unique_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    week_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    meta: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: TEST_SERIES_TYPES.OTHER,
    },
  },
  {
    sequelize,
    modelName: 'TestSeries',
    tableName: 'test_series',
  },
);

export { TEST_SERIES_TYPES };
