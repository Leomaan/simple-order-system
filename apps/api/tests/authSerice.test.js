import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, refresh, logout } from '../src/services/authService.js';
import User from '../src/models/user.js';
import RefreshToken from '../src/models/refreshToken.js';
import { AppError } from '../src/middleware/appError.js';
import bcrypt from 'bcryptjs';

vi.mock('../src/models/user.js', () => ({
  default: { findOne: vi.fn() }
}));

vi.mock('../src/models/refreshToken.js', () => ({
  default: {
    create:  vi.fn(),
    findOne: vi.fn(),
    destroy: vi.fn(),
  }
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    hash:    vi.fn(),
  }
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mocked_token'),
  }
}));

beforeEach(() => vi.clearAllMocks());

describe('login', () => {
  it('deve fazer login com sucesso', async () => {
    User.findOne.mockResolvedValue({ id: 1, role: 'ADMIN', name: 'Admin', active: true, password: 'hashed' });
    bcrypt.compare.mockResolvedValue(true);
    RefreshToken.create.mockResolvedValue(true);

    const result = await login('admin@test.com', '123456');

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).toHaveProperty('role', 'ADMIN');
    expect(result).toHaveProperty('name', 'Admin');
  });

  it('deve lançar AppError se usuário não existir', async () => {
    User.findOne.mockResolvedValue(null);

    await expect(login('naoexiste@test.com', '123456'))
      .rejects.toMatchObject({ status: 401, message: 'credenciais inválidas' });
  });

  it('deve lançar AppError se usuário estiver inativo', async () => {
    User.findOne.mockResolvedValue({ id: 1, active: false });

    await expect(login('inativo@test.com', '123456'))
      .rejects.toMatchObject({ status: 401, message: 'credenciais inválidas' });
  });

  it('deve lançar AppError se senha for incorreta', async () => {
    User.findOne.mockResolvedValue({ id: 1, active: true, password: 'hashed' });
    bcrypt.compare.mockResolvedValue(false);

    await expect(login('admin@test.com', 'errada'))
      .rejects.toMatchObject({ status: 401, message: 'credenciais inválidas' });
  });
});

describe('refresh', () => {
  it('deve gerar novo accessToken com sucesso', async () => {
    RefreshToken.findOne.mockResolvedValue({
      expiresAt: new Date(Date.now() + 99999999),
      User: { id: 1, active: true, role: 'ADMIN', name: 'Admin' },
    });

    const result = await refresh('valid_token');

    expect(result).toHaveProperty('accessToken');
  });

  it('deve lançar AppError se refresh token não for fornecido', async () => {
    await expect(refresh(null))
      .rejects.toMatchObject({ status: 401, message: 'refresh token não fornecido' });
  });

  it('deve lançar AppError se refresh token não existir', async () => {
    RefreshToken.findOne.mockResolvedValue(null);

    await expect(refresh('invalido'))
      .rejects.toMatchObject({ status: 401, message: 'refresh token inválido' });
  });

  it('deve lançar AppError se refresh token estiver expirado', async () => {
    RefreshToken.findOne.mockResolvedValue({
      expiresAt: new Date(Date.now() - 1000),
      destroy: vi.fn(),
    });

    await expect(refresh('expirado'))
      .rejects.toMatchObject({ status: 401, message: 'refresh token expirado' });
  });

  it('deve lançar AppError se usuário estiver inativo', async () => {
    RefreshToken.findOne.mockResolvedValue({
      expiresAt: new Date(Date.now() + 99999999),
      User: { active: false },
    });

    await expect(refresh('token_inativo'))
      .rejects.toMatchObject({ status: 401, message: 'usuário inativo' });
  });
});

describe('logout', () => {
  it('deve fazer logout com sucesso', async () => {
    RefreshToken.destroy.mockResolvedValue(1);

    await logout('valid_token');

    expect(RefreshToken.destroy).toHaveBeenCalledWith({ where: { token: 'valid_token' } });
  });

  it('deve lançar AppError se refresh token não for fornecido', async () => {
    await expect(logout(null))
      .rejects.toMatchObject({ status: 400, message: 'refresh token não fornecido' });
  });
});