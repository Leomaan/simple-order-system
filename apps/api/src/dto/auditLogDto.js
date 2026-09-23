export function formatAuditLogDto(log) {
  if (!log) return null;

  const raw = typeof log.toJSON === 'function' ? log.toJSON() : log;

  return {
    id: raw.id,
    userId: raw.userId !== undefined ? raw.userId : null,
    userName: raw.userName || null,
    action: raw.action,
    entity: raw.entity,
    entityId: raw.entityId !== undefined ? raw.entityId : null,
    details: raw.details || null,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
  };
}
