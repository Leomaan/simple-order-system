import { DataTypes } from 'sequelize';
import { sequelize } from '../db/conn.js';

const Company = sequelize.define('Company', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  cnpj: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  config: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      permitirPedidoCliente: true,
      exigirAprovacaoGarcom: true,
      taxaServico: 10,
      tempoAlertaKdsMinutos: 15,
    },
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
      unique: true,
      fields: ['slug'],
    },
    {
      fields: ['active'],
    },
  ],
});

export default Company;
