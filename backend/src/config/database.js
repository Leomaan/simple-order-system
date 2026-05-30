const dbConfig = {
  host:  process.env.DB_HOST,
  port:  process.env.DB_PORT || 3306,
  user:  process.env.DB_USER,
  pass:  process.env.DB_PASS,
  database: process.env.DB_NAME,
  dialect: 'mysql',
}
export default dbConfig;