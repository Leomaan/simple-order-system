import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import { sequelize } from './src/models/index.js';
import { Op } from 'sequelize';
import RefreshToken from './src/models/refreshToken.js';
import { initSocket } from './src/util/socket.js';
import logger from './src/util/logger.js';

const PORT = process.env.PORT || 3000;
const force = process.argv.includes('--force');

async function bootstrap() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force });
      if (force) logger.info('Banco resetado com sucesso!');
      logger.info('Banco conectado e sincronizado com sucesso!');
    } else {
      await sequelize.authenticate();
      logger.info('Banco conectado com sucesso (Produção)!');
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
        logger.info(`Limpeza: ${deleted} tokens de atualização expirados removidos.`);
      }
    } catch (cleanErr) {
      logger.warn('Alerta: Falha ao limpar tokens expirados:', { error: cleanErr.message });
    }

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    const server = httpServer.listen(PORT, () =>
      logger.info(`Servidor rodando na porta ${PORT} com WebSocket (Socket.IO) ativado!`)
    );

    process.on('SIGTERM', async () => {
      logger.info('Encerrando servidor...');
      server.close(async () => {
        await sequelize.close();
        logger.info('Servidor encerrado com sucesso!');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err.message);
    process.exit(1);
  }
}

bootstrap();