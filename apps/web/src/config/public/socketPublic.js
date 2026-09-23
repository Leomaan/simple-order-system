import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const publicSocket = io(API_URL, {
  withCredentials: false,
  autoConnect: false, 
  transports: ['polling', 'websocket'], 
});