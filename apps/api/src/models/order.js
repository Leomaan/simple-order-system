import { DataTypes } from 'sequelize';
import { sequelize } from '../db/conn.js';

const Order = sequelize.define('Order',{
    table:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status:{
        type: DataTypes.ENUM('OPEN', 'PAID', 'CLOSED'),
        allowNull: false,
        defaultValue: 'OPEN'
    },
    paymentMethod:{
        type: DataTypes.ENUM('CASH', 'CARD', 'PIX'),
        allowNull: true,
        defaultValue: null
    },
    paymentId:{
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    paymentQrCode:{
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    paymentQrCodeCopy:{
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    paymentExpiresAt:{
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
    total: {
      type: DataTypes.VIRTUAL,
      get() {
        if (!this.OrderItems) return 0;
        return this.OrderItems.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
      },
    },
}, {
  paranoid: true,
});

export default Order;