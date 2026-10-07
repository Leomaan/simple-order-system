import { describe, it, expect, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import { emitEvent, getIO, socketAuthMiddleware } from '../src/util/socket.js';

describe('socket utility', () => {
  it('não deve lançar erro ao emitir evento com io não inicializado', () => {
    expect(() => emitEvent('test:event', { foo: 'bar' })).not.toThrow();
  });

  it('deve retornar null se getIO for chamado antes de initSocket', () => {
    expect(getIO()).toBeNull();
  });

  describe('WebSocket authentication middleware', () => {
    it('deve rejeitar conexão sem token de autenticação', () => {
      const mockSocket = {
        id: 'sock_1',
        handshake: {
          headers: {},
          auth: {},
        },
      };

      const next = vi.fn();
      socketAuthMiddleware(mockSocket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toContain('token não fornecido');
    });

    it('deve rejeitar conexão com token inválido', () => {
      process.env.JWT_SECRET = 'test_secret_key';
      const mockSocket = {
        id: 'sock_2',
        handshake: {
          headers: {
            cookie: 'accessToken=token_invalido',
          },
          auth: {},
        },
      };

      const next = vi.fn();
      socketAuthMiddleware(mockSocket, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toContain('token inválido ou expirado');
    });

    it('deve aceitar conexão com token válido via cookie', () => {
      process.env.JWT_SECRET = 'test_secret_key';
      const validToken = jwt.sign({ userId: 1, role: 'WAITER' }, process.env.JWT_SECRET);

      const mockSocket = {
        id: 'sock_3',
        handshake: {
          headers: {
            cookie: `accessToken=${validToken}; other=123`,
          },
          auth: {},
        },
      };

      const next = vi.fn();
      socketAuthMiddleware(mockSocket, next);

      expect(next).toHaveBeenCalledWith();
      expect(mockSocket.user).toMatchObject({ userId: 1, role: 'WAITER' });
    });
  });
});
