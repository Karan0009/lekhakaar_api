import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';

const CATEGORY_STATUSES = {
  active: 'active',
  inactive: 'inactive',
};

export default class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CATEGORY_STATUSES)),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    scopes: {
      active: {
        where: {
          status: CATEGORY_STATUSES.active,
        },
      },
    },
  },
);

export { CATEGORY_STATUSES };
