import { DataTypes } from "sequelize";
import { sequelize } from "../db/conn.js";

const Order = sequelize.define('Order',{
    table:{
        type: DataTypes.INTEGER,
        allowNull: false
    },

    total:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
        defaultValue: 0
    },

    status:{
        type: DataTypes.ENUM('OPEN', 'IN PREPARATION', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'OPEN'
    },
})

export default Order;