import 'dotenv/config';
import app from './src/app.js';
import { sequelize } from "./src/models/index.js"

const PORT = process.env.PORT

sequelize.sync()
  .then(() => {
    console.log('Banco conectado com sucesso!');
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('Erro ao conectar no banco:', err.message);
    process.exit(1);
  });