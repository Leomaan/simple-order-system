import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { AppError } from '../middleware/appError.js';

export async function findAll() {
  return User.findAll({
    attributes: ['id', 'name', 'email', 'role', 'active', 'createdAt'],
  });
}

export async function findById(id) {
  const user = await User.findByPk(id, {
    attributes: ['id', 'name', 'email', 'role', 'active', 'createdAt'],
  });
  if (!user) throw new AppError('user not found', 404);
  return user;
}

export async function createUser(data) {
  const { name, email, password, role } = data;

  const exists = await User.findOne({ where: { email } });
  if (exists) throw new AppError('email já cadastrado');

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });

  const { password: _, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
}

export async function updateUser(id, data, requesterId) {
  const user = await findById(id);

  if (id === requesterId && data.active === false)
    throw new AppError('você não pode desativar sua própria conta');

  if (id === requesterId && data.role && data.role !== 'ADMIN')
    throw new AppError('você não pode alterar sua própria role');

  await user.update(data);
  return user;
}

export async function deleteUser(id, requesterId) {
  if (id === requesterId)
    throw new AppError('você não pode deletar sua própria conta');

  const user = await findById(id);
  await user.destroy();
}