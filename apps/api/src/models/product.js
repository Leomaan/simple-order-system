import { DataTypes } from 'sequelize';
import { sequelize } from '../db/conn.js';

const Product = sequelize.define('Product',{
    name:{
        type: DataTypes.STRING,
        allowNull: false,
    },

    price:{
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    description:{
        type: DataTypes.STRING
    },

    imageUrl:{
        type: DataTypes.STRING,
        allowNull: true
    },

    available:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    category:{
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Categories',
          key: 'id',
        },
        onDelete: 'SET NULL',
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    stationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  paranoid: true,
});

export default Product;
