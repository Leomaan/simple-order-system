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

// Relações Multi-Tenant (Company)
Company.hasMany(ProductionStation, { foreignKey: 'companyId', onDelete: 'CASCADE' });
ProductionStation.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Category, { foreignKey: 'companyId', onDelete: 'CASCADE' });
Category.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(User, { foreignKey: 'companyId', onDelete: 'CASCADE' });
User.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Product, { foreignKey: 'companyId', onDelete: 'CASCADE' });
Product.belongsTo(Company, { foreignKey: 'companyId' });

// Relações de Categorias e Estações KDS
ProductionStation.hasMany(Category, { foreignKey: 'stationId', onDelete: 'SET NULL' });
Category.belongsTo(ProductionStation, { foreignKey: 'stationId' });

Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'SET NULL' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

Company.hasMany(Order, { foreignKey: 'companyId', onDelete: 'CASCADE' });
Order.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Settings, { foreignKey: 'companyId', onDelete: 'CASCADE' });
Settings.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(AuditLog, { foreignKey: 'companyId', onDelete: 'CASCADE' });
AuditLog.belongsTo(Company, { foreignKey: 'companyId' });

// Relações KDS (ProductionStation)
ProductionStation.hasMany(Product, { foreignKey: 'stationId', onDelete: 'SET NULL' });
Product.belongsTo(ProductionStation, { foreignKey: 'stationId' });

ProductionStation.hasMany(OrderItem, { foreignKey: 'stationId', onDelete: 'SET NULL' });
OrderItem.belongsTo(ProductionStation, { foreignKey: 'stationId' });

// Relações de Pedidos e Itens
Order.hasMany(OrderItem, { foreignKey: 'OrderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

User.hasMany(OrderItem, { foreignKey: 'deliveredById', as: 'DeliveredItems' });
OrderItem.belongsTo(User, { foreignKey: 'deliveredById', as: 'DeliveredBy' });

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