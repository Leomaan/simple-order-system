import { DataTypes } from "sequelize";
import { sequelize } from "../db/conn.js";

const Order = sequelize.define('Order',{
    table:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status:{
        type: DataTypes.ENUM('OPEN', 'PAID', 'CLOSED'),
        allowNull: false,
        defaultValue: 'OPEN'
    },
})

export default Order;