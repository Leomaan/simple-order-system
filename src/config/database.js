const dbConfig = {
  host:  process.env.DB_HOST,     
  user: process.env.DB_USER,     
  pass: process.env.DB_PASS,    
  database: process.env.DB_NAME,     
  dialect:  'mysql',
  PORT : 3000,
}

export default dbConfig;