import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { AppError } from '../middleware/appError.js';

export async function findAll(onlyDeleted = false, page, limit) {
  const where = {};
  const queryOptions = {
    attributes: ['id', 'name', 'email', 'role', 'active', 'isSuperAdmin', 'createdAt', 'deletedAt'],
    where,
    order: [['name', 'ASC']],
  };
  if (onlyDeleted) {
    const { Op } = await import('sequelize');
    queryOptions.paranoid = false;
    where.deletedAt = { [Op.ne]: null };
  }

  if (page && limit) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    queryOptions.limit = parsedLimit;
    queryOptions.offset = offset;

    const { count, rows } = await User.findAndCountAll(queryOptions);
    return {
      users: rows,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      totalUsers: count,
    };
  }

  return User.findAll(queryOptions);
}

export async function findById(id) {
  const user = await User.findByPk(id, {
    attributes: ['id', 'name', 'email', 'role', 'active', 'isSuperAdmin', 'createdAt'],
  });
  if (!user) throw new AppError('user not found', 404);
  return user;
}

export async function createUser(data) {
  const { name, email, password, role } = data;

  // Buscar incluindo usuários deletados (soft delete)
  const exists = await User.findOne({ where: { email }, paranoid: false });
  if (exists) {
    if (!exists.deletedAt) {
      throw new AppError('email já cadastrado');
    }
    
    // Se o usuário estava deletado logicamente, restauramos e atualizamos com os novos dados
    const hashed = await bcrypt.hash(password, 10);
    await exists.restore();
    await exists.update({ name, password: hashed, role, active: true });
    
    const { password: _, ...userWithoutPassword } = exists.toJSON();
    return userWithoutPassword;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });

  const { password: _, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
}

export async function updateUser(id, data, requesterId) {
  const requester = await User.findByPk(requesterId);
  const user = await findById(id);

  // SUPERADMIN não pode ser alterado por ninguém exceto ele mesmo (e mesmo assim com restrições)
  if (user.isSuperAdmin && requesterId !== id)
    throw new AppError('não é possível alterar o superadmin');

  // Garçom Demo não pode ser alterado por ninguém exceto o SuperAdmin
  if (user.email === 'waiter@restaurant.com' && !requester.isSuperAdmin)
    throw new AppError('a conta de demonstração do garçom não pode ser alterada');

  // ninguém pode remover o isSuperAdmin
  if ('isSuperAdmin' in data)
    throw new AppError('não é possível alterar o status de superadmin');

  // admin não pode se desativar
  if (id === requesterId && data.active === false)
    throw new AppError('você não pode desativar sua própria conta');

  // admin não pode rebaixar a si mesmo
  if (id === requesterId && data.role && data.role !== 'ADMIN')
    throw new AppError('você não pode alterar sua própria role');

  // só superadmin pode alterar role de outros admins
  if (user.role === 'ADMIN' && data.role && !requester.isSuperAdmin)
    throw new AppError('apenas o superadmin pode alterar a role de um admin');

  await user.update(data);
  return user;
}

export async function deleteUser(id, requesterId) {
  if (id === requesterId)
    throw new AppError('você não pode deletar sua própria conta');

  const user = await findById(id);

  if (user.isSuperAdmin)
    throw new AppError('o superadmin não pode ser deletado');

  // Garçom Demo não pode ser deletado por ninguém exceto o SuperAdmin
  const requester = await User.findByPk(requesterId);
  if (user.email === 'waiter@restaurant.com' && !requester.isSuperAdmin)
    throw new AppError('a conta de demonstração do garçom não pode ser deletada');

  // só superadmin pode fazer soft delete de outros admins
  if (user.role === 'ADMIN' && !requester.isSuperAdmin)
    throw new AppError('apenas o superadmin pode deletar um admin');

  await user.destroy();
  return user;
}

export async function restoreUser(id) {
  const user = await User.findOne({ where: { id }, paranoid: false });
  if (!user) throw new AppError('user not found or not deleted', 404);
  await user.restore();
  await user.update({ active: true });
  return user;
}

export async function permanentDeleteUser(id, requesterId) {
  if (id === requesterId)
    throw new AppError('você não pode deletar sua própria conta');

  const user = await User.findByPk(id, { paranoid: false });
  if (!user) throw new AppError('user not found', 404);

  if (user.isSuperAdmin)
    throw new AppError('o superadmin não pode ser deletado');

  const requester = await User.findByPk(requesterId);
  if (user.email === 'waiter@restaurant.com' && !requester.isSuperAdmin)
    throw new AppError('a conta de demonstração do garçom não pode ser deletada permanentemente');
  if (user.role === 'ADMIN' && !requester.isSuperAdmin)
    throw new AppError('apenas o superadmin pode deletar permanentemente um admin');

  await user.destroy({ force: true });
  return user;
}