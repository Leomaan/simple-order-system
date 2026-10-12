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

    // Se for uma conexão anônima de cliente no cardápio da mesa
    if (!token) {
      const publicSlug = socket.handshake.query?.slug || socket.handshake.auth?.slug;
      const tableNumber = socket.handshake.query?.table || socket.handshake.auth?.table;

      if (publicSlug && tableNumber) {
        socket.isPublicClient = true;
        socket.publicSlug = publicSlug;
        socket.tableNumber = tableNumber;
        return next();
      }

      logger.warn('Conexão WebSocket rejeitada: token ausente e sem identificação de mesa', {
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

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    // Se for cliente público do cardápio, insere automaticamente na sala da sua mesa
    if (socket.isPublicClient) {
      const tableRoom = `company:${socket.publicSlug}:table:${socket.tableNumber}`;
      socket.join(tableRoom);
      logger.info(`Cliente de mesa público conectado na sala ${tableRoom}`, {
        context: 'websocket',
        socketId: socket.id,
        slug: socket.publicSlug,
        table: socket.tableNumber,
      });
    } else {
      logger.info(`Novo colaborador WebSocket autenticado conectado`, {
        context: 'websocket',
        socketId: socket.id,
        userId: socket.user?.userId || socket.user?.id,
        role: socket.user?.role,
        companyId: socket.user?.companyId,
      });

      // Auto-join nas salas operacionais da empresa do colaborador
      if (socket.user?.companyId) {
        const companyRoom = `company:${socket.user.companyId}`;
        socket.join(companyRoom);
        
        if (socket.user.role === 'WAITER' || socket.user.role === 'ADMIN') {
          socket.join(`company:${socket.user.companyId}:waiters`);
        }
      }
    }

    // Permite ingressar em estações específicas do KDS (ex: station_12)
    socket.on('join_station', (stationId) => {
      if (!socket.isPublicClient && socket.user?.companyId && stationId) {
        const stationRoom = `company:${socket.user.companyId}:station:${stationId}`;
        socket.join(stationRoom);
        logger.info(`Socket ingressou na estação KDS: ${stationRoom}`, { context: 'websocket', socketId: socket.id });
      }
    });

    socket.on('join_room', (room) => {
      if (room && typeof room === 'string' && room.length <= 80) {
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
