import { DataTypes } from "sequelize";
import { sequelize } from "../db/conn.js";

const Product = sequelize.define('Product',{
    name:{
        type: DataTypes.STRING,
        allowNull: false,
    },

    price:{
        type: DataTypes.DECIMAL(10.2),
        allowNull: false
    },

    description:{
        type: DataTypes.STRING
    },

    available:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
})

export default Product;