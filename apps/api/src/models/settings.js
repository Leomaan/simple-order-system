import { DataTypes } from 'sequelize';
import { sequelize } from '../db/conn.js';

const Settings = sequelize.define('Settings', {
  restaurantName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Simple Order Restaurant',
  },
  mercadoPagoAccessToken: {
    type: DataTypes.STRING(512),
    allowNull: true,
    defaultValue: null,
  },
  mercadoPagoWebhookSecret: {
    type: DataTypes.STRING(256),
    allowNull: true,
    defaultValue: null,
  },
}, {
  tableName: 'Settings',
});

export default Settings;
