import { DataTypes } from 'sequelize';
import { sequelize } from '../db/conn.js';
import { encrypt, decrypt } from '../util/crypto.js';

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
    get() {
      const rawValue = this.getDataValue('mercadoPagoAccessToken');
      return rawValue ? decrypt(rawValue) : null;
    },
    set(value) {
      if (value === null || value === '') {
        this.setDataValue('mercadoPagoAccessToken', null);
      } else {
        this.setDataValue('mercadoPagoAccessToken', encrypt(value));
      }
    }
  },
  mercadoPagoWebhookSecret: {
    type: DataTypes.STRING(256),
    allowNull: true,
    defaultValue: null,
    get() {
      const rawValue = this.getDataValue('mercadoPagoWebhookSecret');
      return rawValue ? decrypt(rawValue) : null;
    },
    set(value) {
      if (value === null || value === '') {
        this.setDataValue('mercadoPagoWebhookSecret', null);
      } else {
        this.setDataValue('mercadoPagoWebhookSecret', encrypt(value));
      }
    }
  },
}, {
  tableName: 'Settings',
});

export default Settings;
