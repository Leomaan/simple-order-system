import { DataTypes } from 'sequelize';
import { sequelize } from '../db/conn.js';

const Category = sequelize.define('Category', {
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Companies',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  stationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ProductionStations',
      key: 'id',
    },
    onDelete: 'SET NULL',
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
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
      fields: ['companyId', 'slug'],
    },
    {
      fields: ['companyId', 'orderIndex'],
    },
  ],
});

export default Category;
