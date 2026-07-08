import 'dotenv/config';
import app from './src/app.js';
import { sequelize } from './src/models/index.js';
import { Op } from 'sequelize';
import RefreshToken from './src/models/refreshToken.js';

const PORT = process.env.PORT || 3000;
const force = process.argv.includes('--force');

async function bootstrap() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force });
      if (force) console.log('Banco resetado com sucesso!');
      console.log('Banco conectado e sincronizado com sucesso!');
    } else {
      await sequelize.authenticate();
      console.log('Banco conectado com sucesso (Produção)!');
    }

    // Limpeza de refresh tokens expirados na inicialização
    try {
      const deleted = await RefreshToken.destroy({
        where: {
          expiresAt: {
            [Op.lt]: new Date()
          }
        }
      });
      if (deleted > 0) {
        console.log(`Limpeza: ${deleted} tokens de atualização expirados removidos.`);
      }
    } catch (cleanErr) {
      console.warn('Alerta: Falha ao limpar tokens expirados:', cleanErr.message);
    }

    const server = app.listen(PORT, () =>
      console.log(`Servidor rodando na porta ${PORT}`)
    );

    process.on('SIGTERM', async () => {
      console.log(' Encerrando servidor...');
      server.close(async () => {
        await sequelize.close();
        console.log('Servidor encerrado com sucesso!');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err.message);
    process.exit(1);
  }
}

bootstrap();