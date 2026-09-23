export function formatUserDto(user) {
  if (!user) return null;

  const raw = typeof user.toJSON === 'function' ? user.toJSON() : user;

  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    active: Boolean(raw.active),
    isSuperAdmin: Boolean(raw.isSuperAdmin),
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    deletedAt: raw.deletedAt ? new Date(raw.deletedAt).toISOString() : null,
  };
}
