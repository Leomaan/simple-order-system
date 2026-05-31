import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAll, findById, createUser, updateUser, deleteUser } from '../src/services/userService.js';
import User from '../src/models/user.js';
import { AppError } from '../src/middleware/appError.js';
import bcrypt from 'bcryptjs';

vi.mock('../src/models/user.js', () => ({
  default: {
    findAll:  vi.fn(),
    findByPk: vi.fn(),
    findOne:  vi.fn(),
    create:   vi.fn(),
  }
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash:    vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  }
}));

beforeEach(() => vi.clearAllMocks());

describe('findAll', () => {
  it('deve retornar todos os usuários', async () => {
    const users = [{ id: 1, name: 'Admin', role: 'ADMIN' }];
    User.findAll.mockResolvedValue(users);

    const result = await findAll();

    expect(result).toEqual(users);
    expect(User.findAll).toHaveBeenCalledOnce();
  });
});

describe('findById', () => {
  it('deve retornar o usuário pelo id', async () => {
    const user = { id: 1, name: 'Admin' };
    User.findByPk.mockResolvedValue(user);

    const result = await findById(1);

    expect(result).toEqual(user);
  });

  it('deve lançar AppError 404 se usuário não existir', async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(findById(99)).rejects.toMatchObject({ status: 404, message: 'user not found' });
  });
});

describe('createUser', () => {
  it('deve criar um usuário com sucesso', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      toJSON: () => ({ id: 1, name: 'João', email: 'joao@test.com', role: 'WAITER', password: 'hashed' })
    });

    const result = await createUser({ name: 'João', email: 'joao@test.com', password: '123456', role: 'WAITER' });

    expect(result).not.toHaveProperty('password');
    expect(User.create).toHaveBeenCalledOnce();
  });

  it('deve lançar AppError se email já cadastrado', async () => {
    User.findOne.mockResolvedValue({ id: 1, email: 'joao@test.com' });

    await expect(createUser({ name: 'João', email: 'joao@test.com', password: '123456', role: 'WAITER' }))
      .rejects.toMatchObject({ message: 'email já cadastrado' });
  });

  it('deve fazer hash da senha antes de salvar', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      toJSON: () => ({ id: 1, name: 'João', email: 'joao@test.com', role: 'WAITER', password: 'hashed' })
    });

    await createUser({ name: 'João', email: 'joao@test.com', password: '123456', role: 'WAITER' });

    expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
  });
});

describe('updateUser', () => {
  it('deve atualizar um usuário com sucesso', async () => {
    const user = { id: 2, name: 'João', update: vi.fn().mockResolvedValue(true) };
    User.findByPk.mockResolvedValue(user);

    await updateUser(2, { name: 'João Silva' }, 1);

    expect(user.update).toHaveBeenCalledWith({ name: 'João Silva' });
  });

  it('deve lançar AppError se admin tentar desativar a si mesmo', async () => {
    const user = { id: 1, name: 'Admin', update: vi.fn() };
    User.findByPk.mockResolvedValue(user);

    await expect(updateUser(1, { active: false }, 1))
      .rejects.toMatchObject({ message: 'você não pode desativar sua própria conta' });
  });

  it('deve lançar AppError se admin tentar alterar a própria role', async () => {
    const user = { id: 1, name: 'Admin', update: vi.fn() };
    User.findByPk.mockResolvedValue(user);

    await expect(updateUser(1, { role: 'WAITER' }, 1))
      .rejects.toMatchObject({ message: 'você não pode alterar sua própria role' });
  });
});

describe('deleteUser', () => {
  it('deve deletar um usuário com sucesso', async () => {
    const user = { id: 2, destroy: vi.fn().mockResolvedValue(true) };
    User.findByPk.mockResolvedValue(user);

    await deleteUser(2, 1);

    expect(user.destroy).toHaveBeenCalledOnce();
  });

  it('deve lançar AppError se admin tentar deletar a si mesmo', async () => {
    await expect(deleteUser(1, 1))
      .rejects.toMatchObject({ message: 'você não pode deletar sua própria conta' });
  });

  it('deve lançar AppError se usuário não existir', async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(deleteUser(99, 1)).rejects.toMatchObject({ status: 404 });
  });
});