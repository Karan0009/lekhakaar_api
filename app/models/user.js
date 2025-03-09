import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';
import { v1 as uuidv1 } from 'uuid';

const USER_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export default class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: USER_STATUSES.ACTIVE,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: (user) => {
        user.id = uuidv1();
      },
    },
  },
);

export { USER_STATUSES };
