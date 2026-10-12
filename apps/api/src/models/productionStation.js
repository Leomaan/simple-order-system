import { DataTypes } from 'sequelize';
import { sequelize } from '../db/conn.js';

const ProductionStation = sequelize.define('ProductionStation', {
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Companies',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#64748b',
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  paranoid: true,
  indexes: [
    {
      fields: ['companyId'],
    },
    {
      unique: true,
      fields: ['companyId', 'slug'],
    },
  ],
});

export default ProductionStation;
