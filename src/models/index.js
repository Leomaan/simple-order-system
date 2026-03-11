import {sequelize} from '../db/conn.js'
import Order from './order.js';
import Product from './product.js';
import OrderItem from './orderItem.js';

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

export { sequelize};