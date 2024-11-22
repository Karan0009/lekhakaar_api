import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

export default class Session extends Model {}

Session.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    session_data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'WaSession',
    tableName: 'wa_sessions',
  },
);
