import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from './logger.js';
import corsOptions from '../config/cors.js';

let io = null;

function parseCookies(cookieHeader = '') {
  if (!cookieHeader || typeof cookieHeader !== 'string') return {};
  return cookieHeader.split(';').reduce((res, c) => {
    const [k, v] = c.trim().split('=');
    if (k && v) res[k] = decodeURIComponent(v);
    return res;
  }, {});
}

export function socketAuthMiddleware(socket, next) {
  try {
    const cookies = parseCookies(socket.handshake.headers?.cookie);
    const authHeader = socket.handshake.headers?.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = socket.handshake.auth?.token || cookies.accessToken || bearerToken;

    if (!token) {
      logger.warn('Conexão WebSocket rejeitada: token ausente', {
        context: 'websocket',
        socketId: socket.id,
        ip: socket.handshake.address,
      });
      return next(new Error('Authentication error: token não fornecido'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    logger.warn('Conexão WebSocket rejeitada: token inválido ou expirado', {
      context: 'websocket',
      socketId: socket.id,
      error: err.message,
    });
    return next(new Error('Authentication error: token inválido ou expirado'));
  }
}

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: corsOptions,
  });

  // Middleware de autenticação obrigatório para conexões WebSocket
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    logger.info(`Novo cliente WebSocket autenticado conectado`, {
      context: 'websocket',
      socketId: socket.id,
      userId: socket.user?.userId || socket.user?.id,
      role: socket.user?.role,
    });

    // Permite que o cliente entre em salas específicas (ex: "room:waiters", "room:admin", "order_12")
    socket.on('join_room', (room) => {
      if (room && typeof room === 'string' && room.length <= 50) {
        socket.join(room);
        logger.info(`Socket ingressou na sala: ${room}`, { context: 'websocket', socketId: socket.id, room });
      }
    });

    socket.on('leave_room', (room) => {
      if (room && typeof room === 'string') {
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

export function getIO() {
  return io;
}

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
