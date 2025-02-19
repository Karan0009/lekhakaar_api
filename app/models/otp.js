import { DataTypes, Model } from 'sequelize';
import sequelize from '../lib/sequelize.js';
import { ulid } from 'ulid';

const OTP_STATUSES = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
};

export default class Otp extends Model {}

Otp.init(
  {
    id: {
      type: DataTypes.STRING(26),
      primaryKey: true,
    },
    otp_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OTP_STATUSES)),
      allowNull: false,
      defaultValue: OTP_STATUSES.PENDING,
    },
    expiry_at: {
      type: DataTypes.DATE,
      allowNull: false,
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
    modelName: 'Otp',
    tableName: 'otps',
    timestamps: true,
    underscored: true,
  },
);

// Automatically set ULID before creating a new OTP
Otp.beforeCreate((otp) => {
  otp.id = ulid();
});

export { OTP_STATUSES };
