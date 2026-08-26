import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';
import { AppError } from '../middleware/appError.js';
import { calculateDiff } from '../util/diff.js';
import { log } from './auditLogService.js';
import logger from '../util/logger.js';
import { assertCanUpdateUser, assertCanDeleteUser } from '../policies/userPolicy.js';

const USER_DIFF_FIELDS = ['name', 'role', 'active'];

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

export async function createUser(data, currentUser = null) {
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
    
    await log({
      user: currentUser,
      action: 'RESTORE_AND_UPDATE_USER',
      entity: 'User',
      entityId: exists.id,
      details: { name: exists.name, role: exists.role }
    });

    return userWithoutPassword;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role });

  const { password: _, ...userWithoutPassword } = user.toJSON();

  await log({
    user: currentUser,
    action: 'CREATE_USER',
    entity: 'User',
    entityId: user.id,
    details: { name: user.name, role: user.role }
  });

  logger.info('Novo usuário cadastrado', { context: 'user_service', createdUserId: user.id, role: user.role });

  return userWithoutPassword;
}

export async function updateUser(id, data, requester) {
  const requesterId = typeof requester === 'object' && requester !== null ? requester.userId : requester;
  const requesterUser = typeof requester === 'object' && requester !== null ? requester : { userId: requester };

  const authUserId = Number(requesterId);

  const [requesterRecord, user] = await Promise.all([
    User.findByPk(requesterId),
    findById(id)
  ]);

  // Aplica política de autorização externa
  assertCanUpdateUser(user, requesterRecord, data, authUserId);

  const oldValues = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  await user.update(data);
  const newValues = typeof user.toJSON === 'function' ? user.toJSON() : { ...user, ...data };

  const diff = calculateDiff(oldValues, newValues, USER_DIFF_FIELDS);

  await log({
    user: requesterUser,
    action: 'UPDATE_USER',
    entity: 'User',
    entityId: user.id,
    details: { name: newValues.name, diff }
  });

  logger.info('Usuário atualizado', { context: 'user_service', updatedUserId: user.id, updatedBy: authUserId });

  return user;
}

export async function deleteUser(id, requester) {
  const requesterId = typeof requester === 'object' && requester !== null ? requester.userId : requester;
  const requesterUser = typeof requester === 'object' && requester !== null ? requester : { userId: requester };

  const authUserId = Number(requesterId);

  const [requesterRecord, user] = await Promise.all([
    User.findByPk(requesterId),
    findById(id)
  ]);

  // Aplica política de autorização externa
  assertCanDeleteUser(user, requesterRecord, authUserId, false);

  await user.destroy();

  await log({
    user: requesterUser,
    action: 'DELETE_USER',
    entity: 'User',
    entityId: Number(id),
    details: { name: user.name }
  });

  logger.warn('Usuário desativado/removido (Soft Delete)', { context: 'user_service', targetUserId: id, removedBy: authUserId });

  return user;
}

export async function restoreUser(id, currentUser = null) {
  const user = await User.findOne({ where: { id }, paranoid: false });
  if (!user) throw new AppError('user not found or not deleted', 404);
  await user.restore();
  await user.update({ active: true });

  await log({
    user: currentUser,
    action: 'RESTORE_USER',
    entity: 'User',
    entityId: user.id,
    details: { name: user.name }
  });

  logger.info('Usuário restaurado', { context: 'user_service', restoredUserId: user.id });

  return user;
}

export async function permanentDeleteUser(id, requester) {
  const requesterId = typeof requester === 'object' && requester !== null ? requester.userId : requester;
  const requesterUser = typeof requester === 'object' && requester !== null ? requester : { userId: requester };

  const authUserId = Number(requesterId);

  const [requesterRecord, user] = await Promise.all([
    User.findByPk(requesterId),
    User.findByPk(id, { paranoid: false })
  ]);

  if (!user) throw new AppError('user not found', 404);

  // Aplica política de autorização externa
  assertCanDeleteUser(user, requesterRecord, authUserId, true);

  await user.destroy({ force: true });

  await log({
    user: requesterUser,
    action: 'PERMANENT_DELETE_USER',
    entity: 'User',
    entityId: Number(id),
    details: { name: user.name }
  });

  logger.warn('Usuário excluído permanentemente', { context: 'user_service', targetUserId: id, deletedBy: authUserId });

  return user;
}