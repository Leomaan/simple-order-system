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
  }
});

export default OrderItem;