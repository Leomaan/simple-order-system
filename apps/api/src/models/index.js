import { sequelize } from '../db/conn.js';
import Company from './company.js';
import ProductionStation from './productionStation.js';
import Category from './category.js';
import Order from './order.js';
import Product from './product.js';
import OrderItem from './orderItem.js';
import User from './user.js';
import RefreshToken from './refreshToken.js';
import AuditLog from './auditLog.js';
import Settings from './settings.js';

// Relações Multi-Tenant (Company) com deleção em cascata automática no banco
Company.hasMany(ProductionStation, { foreignKey: 'companyId', onDelete: 'CASCADE', hooks: true });
ProductionStation.belongsTo(Company, { foreignKey: 'companyId', onDelete: 'CASCADE' });

Company.hasMany(Category, { foreignKey: 'companyId', onDelete: 'CASCADE', hooks: true });
Category.belongsTo(Company, { foreignKey: 'companyId', onDelete: 'CASCADE' });

Company.hasMany(User, { foreignKey: 'companyId', onDelete: 'CASCADE', hooks: true });
User.belongsTo(Company, { foreignKey: 'companyId', onDelete: 'CASCADE' });

Company.hasMany(Product, { foreignKey: 'companyId', onDelete: 'CASCADE', hooks: true });
Product.belongsTo(Company, { foreignKey: 'companyId', onDelete: 'CASCADE' });

Company.hasMany(Order, { foreignKey: 'companyId', onDelete: 'CASCADE', hooks: true });
Order.belongsTo(Company, { foreignKey: 'companyId', onDelete: 'CASCADE' });

Company.hasMany(Settings, { foreignKey: 'companyId', onDelete: 'CASCADE', hooks: true });
Settings.belongsTo(Company, { foreignKey: 'companyId', onDelete: 'CASCADE' });

Company.hasMany(AuditLog, { foreignKey: 'companyId', onDelete: 'CASCADE', hooks: true });
AuditLog.belongsTo(Company, { foreignKey: 'companyId', onDelete: 'CASCADE' });

// Relações de Categorias e Estações KDS
ProductionStation.hasMany(Category, { foreignKey: 'stationId', onDelete: 'SET NULL' });
Category.belongsTo(ProductionStation, { foreignKey: 'stationId', onDelete: 'SET NULL' });

Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'categoryId', onDelete: 'SET NULL' });

// Relações KDS (ProductionStation)
ProductionStation.hasMany(Product, { foreignKey: 'stationId', onDelete: 'SET NULL' });
Product.belongsTo(ProductionStation, { foreignKey: 'stationId', onDelete: 'SET NULL' });

ProductionStation.hasMany(OrderItem, { foreignKey: 'stationId', onDelete: 'SET NULL' });
OrderItem.belongsTo(ProductionStation, { foreignKey: 'stationId', onDelete: 'SET NULL' });

// Relações de Pedidos e Itens
Order.hasMany(OrderItem, { foreignKey: 'OrderId', onDelete: 'CASCADE', hooks: true });
OrderItem.belongsTo(Order, { foreignKey: 'OrderId', onDelete: 'CASCADE' });

Product.hasMany(OrderItem, { foreignKey: 'ProductId', onDelete: 'SET NULL' });
OrderItem.belongsTo(Product, { foreignKey: 'ProductId', onDelete: 'SET NULL' });

User.hasMany(OrderItem, { foreignKey: 'deliveredById', as: 'DeliveredItems', onDelete: 'SET NULL' });
OrderItem.belongsTo(User, { foreignKey: 'deliveredById', as: 'DeliveredBy', onDelete: 'SET NULL' });

export { 
  sequelize, 
  Company, 
  ProductionStation, 
  Category,
  Order, 
  Product, 
  OrderItem, 
  User, 
  RefreshToken, 
  AuditLog, 
  Settings 
};
