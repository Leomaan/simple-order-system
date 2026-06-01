import AuditLog from '../models/auditLog.js';

export async function log({ user, action, entity, entityId, details, ip }) {
  try {
    await AuditLog.create({
      userId:   user?.userId || null,
      userName: user?.name   || 'system',
      userRole: user?.role   || 'system',
      action,
      entity:   entity   || null,
      entityId: entityId || null,
      details:  details  ? JSON.stringify(details) : null,
      ip:       ip       || null,
    });
  } catch (err) {
    console.error('Erro ao salvar log:', err.message);
  }
}

export async function findAll({ userId, action, entity, from, to } = {}) {
  const where = {};

  if (userId)  where.userId = userId;
  if (action)  where.action = action;
  if (entity)  where.entity = entity;
  if (from || to) {
    const { Op } = await import('sequelize');
    where.createdAt = {};
    if (from) where.createdAt[Op.gte] = new Date(from);
    if (to)   where.createdAt[Op.lte] = new Date(to);
  }

  return AuditLog.findAll({
  where,
  order: [['createdAt', 'DESC']],
}).then(logs => logs.map(log => ({
  ...log.toJSON(),
  details: log.details ? JSON.parse(log.details) : null,
})));
}   