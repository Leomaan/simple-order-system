import { Server } from 'socket.io';
import logger from './logger.js';
import corsOptions from '../config/cors.js';

let io = null;

/**
 * Inicializa a instância do Socket.IO acoplada ao servidor HTTP do Node.js.
 * @param {import('http').Server} httpServer 
 * @returns {Server}
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.on('connection', (socket) => {
    logger.info(`Novo cliente WebSocket conectado`, { context: 'websocket', socketId: socket.id });

    // Permite que o cliente entre em salas específicas (ex: "room:waiters", "room:admin", "order_12")
    socket.on('join_room', (room) => {
      if (room) {
        socket.join(room);
        logger.info(`Socket ingressou na sala: ${room}`, { context: 'websocket', socketId: socket.id, room });
      }
    });

    socket.on('leave_room', (room) => {
      if (room) {
        socket.leave(room);
        logger.info(`Socket saiu da sala: ${room}`, { context: 'websocket', socketId: socket.id, room });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Cliente WebSocket desconectado`, { context: 'websocket', socketId: socket.id, reason });
    });
  });

  return io;
}

/**
 * Retorna a instância ativa do Socket.IO.
 * @returns {Server|null}
 */
export function getIO() {
  return io;
}

/**
 * Emite um evento em tempo real para todos os clientes ou para uma sala específica.
 * @param {string} event - Nome do evento (ex: 'order:created', 'order:updated')
 * @param {object} data - Dados a serem transmitidos
 * @param {string} [room] - Nome opcional da sala
 */
export function emitEvent(event, data, room = null) {
  if (!io) return;

  try {
    if (room) {
      io.to(room).emit(event, data);
    } else {
      io.emit(event, data);
    }
  } catch (err) {
    logger.error('Erro ao emitir evento via WebSocket', { context: 'websocket', event, error: err.message });
  }
}
