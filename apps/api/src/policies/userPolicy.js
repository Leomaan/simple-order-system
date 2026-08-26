import { AppError } from '../middleware/appError.js';

/**
 * Valida regras de permissão e proteção para atualização de usuários.
 *
 * @param {Object} targetUser - Usuário que sofrerá a alteração
 * @param {Object} requesterRecord - Registro do usuário solicitante no banco
 * @param {Object} updateData - Payload de dados a serem alterados
 * @param {number} authUserId - ID do usuário autenticado solicitante
 */
export function assertCanUpdateUser(targetUser, requesterRecord, updateData, authUserId) {
  const targetId = Number(targetUser.id);

  // SUPERADMIN não pode ser alterado por ninguém exceto ele mesmo
  if (targetUser.isSuperAdmin && authUserId !== targetId) {
    throw new AppError('não é possível alterar o superadmin');
  }

  // Garçom Demo não pode ser alterado por ninguém exceto o SuperAdmin
  if (targetUser.email === 'waiter@restaurant.com' && !requesterRecord?.isSuperAdmin) {
    throw new AppError('a conta de demonstração do garçom não pode ser alterada');
  }

  // Ninguém pode alterar o status de isSuperAdmin diretamente
  if ('isSuperAdmin' in updateData) {
    throw new AppError('não é possível alterar o status de superadmin');
  }

  // Regras quando o próprio usuário tenta se alterar
  if (targetId === authUserId) {
    if (updateData.active === false) {
      throw new AppError('você não pode desativar sua própria conta');
    }
    if (updateData.role && updateData.role !== 'ADMIN') {
      throw new AppError('você não pode alterar sua própria role');
    }
  }

  // Apenas SuperAdmin pode alterar a role de outros admins
  if (targetUser.role === 'ADMIN' && updateData.role && !requesterRecord?.isSuperAdmin) {
    throw new AppError('apenas o superadmin pode alterar a role de um admin');
  }
}

/**
 * Valida regras de permissão e proteção para exclusão de usuários (soft delete ou permanente).
 *
 * @param {Object} targetUser - Usuário alvo da exclusão
 * @param {Object} requesterRecord - Registro do usuário solicitante no banco
 * @param {number} authUserId - ID do usuário autenticado solicitante
 * @param {boolean} isPermanent - Se a operação é de exclusão permanente
 */
export function assertCanDeleteUser(targetUser, requesterRecord, authUserId, isPermanent = false) {
  const targetId = Number(targetUser.id);

  if (targetId === authUserId) {
    throw new AppError('você não pode deletar sua própria conta');
  }

  if (targetUser.isSuperAdmin) {
    throw new AppError('o superadmin não pode ser deletado');
  }

  const suffix = isPermanent ? ' permanentemente' : '';

  if (targetUser.email === 'waiter@restaurant.com' && !requesterRecord?.isSuperAdmin) {
    throw new AppError(`a conta de demonstração do garçom não pode ser deletada${suffix}`);
  }

  if (targetUser.role === 'ADMIN' && !requesterRecord?.isSuperAdmin) {
    throw new AppError(`apenas o superadmin pode deletar${suffix} um admin`);
  }
}
