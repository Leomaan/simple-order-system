import { DataTypes } from 'sequelize';
import {sequelize} from '../db/conn.js';

const OrderItem = sequelize.define('OrderItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  totalPrice:{
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },
  stationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'QUEUED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'QUEUED',
  },
  deliveredById: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notes: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
  },
});

export default OrderItem;