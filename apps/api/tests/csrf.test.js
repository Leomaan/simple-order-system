import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { csrfProtection, generateCsrfToken } from '../src/middleware/csrf.js';

describe('csrf middleware', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('deve gerar token CSRF hexadecimal de 64 caracteres', () => {
    const token = generateCsrfToken();
    expect(typeof token).toBe('string');
    expect(token).toHaveLength(64);
  });

  it('deve permitir métodos seguros como GET sem validação de token', () => {
    const req = { method: 'GET', path: '/order', originalUrl: '/order' };
    const res = {};
    const next = vi.fn();

    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('deve permitir rota de bypass /auth/login para POST', () => {
    const req = { method: 'POST', path: '/auth/login', originalUrl: '/auth/login' };
    const res = {};
    const next = vi.fn();

    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('NÃO deve permitir bypass quando rota forjada tentar usar query string com rota de bypass', () => {
    const req = {
      method: 'POST',
      path: '/order/1/permanent',
      originalUrl: '/order/1/permanent?/auth/login',
      headers: {},
      cookies: {},
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    csrfProtection(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('CSRF falhou'),
      })
    );
  });

  it('deve rejeitar se cabeçalho ou cookie CSRF estiverem ausentes', () => {
    const req = {
      method: 'POST',
      path: '/order',
      originalUrl: '/order',
      headers: {},
      cookies: {},
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    csrfProtection(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('deve rejeitar se cabeçalho e cookie CSRF forem divergentes', () => {
    const req = {
      method: 'POST',
      path: '/order',
      originalUrl: '/order',
      headers: { 'x-xsrf-token': 'token_a' },
      cookies: { 'XSRF-TOKEN': 'token_b' },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    csrfProtection(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('deve permitir requisição quando cabeçalho e cookie CSRF forem idênticos', () => {
    const token = generateCsrfToken();
    const req = {
      method: 'POST',
      path: '/order',
      originalUrl: '/order',
      headers: { 'x-xsrf-token': token },
      cookies: { 'XSRF-TOKEN': token },
    };
    const res = {};
    const next = vi.fn();

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
