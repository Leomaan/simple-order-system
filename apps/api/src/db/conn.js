import { Sequelize } from 'sequelize';
import dbConfigMap from '../config/database-cli.cjs';

const env = process.env.NODE_ENV || 'development';
const dbConfig = dbConfigMap[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
  }
);

export { sequelize };