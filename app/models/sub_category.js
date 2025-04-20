import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';
import User from './user.js';
import Category from './category.js';

const SUB_CATEGORY_STATUSES = {
  active: 'active',
  inactive: 'inactive',
};

export default class SubCategory extends Model {}

SubCategory.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: Category,
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
      },
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
      type: DataTypes.ENUM(...Object.values(SUB_CATEGORY_STATUSES)),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'SubCategory',
    tableName: 'sub_categories',
    scopes: {
      active: {
        where: {
          status: SUB_CATEGORY_STATUSES.active,
        },
      },
    },
  },
);

export { SUB_CATEGORY_STATUSES };
