import { DataTypes } from 'sequelize';
import { sequelize } from '../db/conn.js';
import User from './user.js';

const RefreshToken = sequelize.define('RefreshToken', {
  token: {
    type: DataTypes.STRING(512),
    allowNull: false,
    unique: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

RefreshToken.belongsTo(User, { foreignKey: 'UserId', onDelete: 'CASCADE' });
User.hasMany(RefreshToken, { foreignKey: 'UserId' });

export default RefreshToken;