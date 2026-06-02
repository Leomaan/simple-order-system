import 'dotenv/config';
import app from './src/app.js';
import { sequelize } from './src/models/index.js'

const PORT = process.env.PORT || 3000;
const force = process.argv.includes('--force');

async function bootstrap() {
  try {
    await sequelize.sync({ force });

    if (force) console.log('⚠️  Banco resetado com sucesso!');
    console.log('✅ Banco conectado com sucesso!');

    const server = app.listen(PORT, () =>
      console.log(`🚀 Servidor rodando na porta ${PORT}`)
    );

    process.on('SIGTERM', async () => {
      console.log('⚠️  Encerrando servidor...');
      server.close(async () => {
        await sequelize.close();
        console.log('✅ Servidor encerrado com sucesso!');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('❌ Erro ao iniciar o servidor:', err.message);
    process.exit(1);
  }
}

bootstrap();