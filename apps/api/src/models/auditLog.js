import { DataTypes } from 'sequelize';
import { sequelize } from '../db/conn.js';

const AuditLog = sequelize.define('AuditLog', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userRole: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.ENUM(
      'LOGIN', 'LOGOUT',
      'CREATE_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'RESTORE_PRODUCT', 'PERMANENT_DELETE_PRODUCT',
      'CREATE_ORDER', 'CLOSE_ORDER', 'DELETE_ORDER', 'UPDATE_ORDER', 'RESTORE_ORDER', 'PERMANENT_DELETE_ORDER',
      'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESTORE_USER', 'PERMANENT_DELETE_USER',
      'ADD_ORDER_ITEM', 'UPDATE_ORDER_ITEM', 'REMOVE_ORDER_ITEM'
    ),
    allowNull: false,
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  updatedAt: false,
});

export default AuditLog;