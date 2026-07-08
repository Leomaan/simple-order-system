import { sequelize } from '../db/conn.js';
import Order from './order.js';
import Product from './product.js';
import OrderItem from './orderItem.js';
import User from './user.js';
import RefreshToken from './refreshToken.js';
import AuditLog from './auditLog.js';
import Settings from './settings.js';

Order.hasMany(OrderItem, { foreignKey: 'OrderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

export { sequelize, Settings };