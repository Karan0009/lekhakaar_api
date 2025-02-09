import { DataTypes, Model } from 'sequelize';
import { ulid } from 'ulid';
import sequelize from '../lib/sequelize.js';

const REFRESH_TOKEN_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export default class RefreshToken extends Model {}

RefreshToken.init(
  {
    id: {
      type: DataTypes.STRING(26), // ULID is a 26-character string
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    expiry_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        REFRESH_TOKEN_STATUS.ACTIVE,
        REFRESH_TOKEN_STATUS.INACTIVE,
      ),
      allowNull: false,
      defaultValue: REFRESH_TOKEN_STATUS.ACTIVE,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'RefreshToken',
    tableName: 'refresh_tokens',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: (token) => {
        if (!token.id) {
          token.id = ulid();
        }
      },
    },
  },
);

export { REFRESH_TOKEN_STATUS };
