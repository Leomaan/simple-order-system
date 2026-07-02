import AuditLog from '../models/auditLog.js';

export async function log({ user, action, entity = null, entityId = null, details = null, ip = null }) {
  try {
    await AuditLog.create({
      userId:   user?.userId ?? null,
      userName: user?.name   ?? 'system',
      userRole: user?.role   ?? 'system',
      action,
      entity,
      entityId,
      details: details ? JSON.stringify(details) : null,
      ip,
    });
  } catch (err) {
    console.error('Erro ao salvar log:', err.message);
  }
}

export async function findAll({ userId, action, entity, from, to, page, limit } = {}) {
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

  const queryOptions = {
    where,
    order: [['createdAt', 'DESC']],
  };

  if (page && limit) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    queryOptions.limit = parsedLimit;
    queryOptions.offset = offset;

    const { count, rows } = await AuditLog.findAndCountAll(queryOptions);
    const parsedLogs = rows.map(log => ({
      ...log.toJSON(),
      details: log.details ? JSON.parse(log.details) : null,
    }));

    return {
      logs: parsedLogs,
      totalPages: Math.ceil(count / parsedLimit),
      currentPage: parsedPage,
      totalLogs: count,
    };
  }

  return AuditLog.findAll(queryOptions).then(logs => logs.map(log => ({
    ...log.toJSON(),
    details: log.details ? JSON.parse(log.details) : null,
  })));
}   