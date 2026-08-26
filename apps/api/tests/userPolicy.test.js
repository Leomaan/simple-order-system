import { describe, it, expect } from 'vitest';
import { assertCanUpdateUser, assertCanDeleteUser } from '../src/policies/userPolicy.js';
import { AppError } from '../src/middleware/appError.js';

describe('userPolicy', () => {
  describe('assertCanUpdateUser', () => {
    it('deve lançar AppError se outro usuário tentar alterar superadmin', () => {
      const target = { id: 1, isSuperAdmin: true };
      const requester = { id: 2, isSuperAdmin: false };

      expect(() => assertCanUpdateUser(target, requester, { name: 'New' }, 2))
        .toThrowError('não é possível alterar o superadmin');
    });

    it('deve lançar AppError se tentar alterar conta demo sem ser superadmin', () => {
      const target = { id: 3, email: 'waiter@restaurant.com' };
      const requester = { id: 2, isSuperAdmin: false };

      expect(() => assertCanUpdateUser(target, requester, { name: 'New' }, 2))
        .toThrowError('a conta de demonstração do garçom não pode ser alterada');
    });

    it('deve permitir que superadmin altere conta demo', () => {
      const target = { id: 3, email: 'waiter@restaurant.com' };
      const requester = { id: 1, isSuperAdmin: true };

      expect(() => assertCanUpdateUser(target, requester, { name: 'New' }, 1))
        .not.toThrow();
    });

    it('deve lançar AppError se tentar alterar campo isSuperAdmin', () => {
      const target = { id: 2 };
      const requester = { id: 1, isSuperAdmin: true };

      expect(() => assertCanUpdateUser(target, requester, { isSuperAdmin: true }, 1))
        .toThrowError('não é possível alterar o status de superadmin');
    });

    it('deve lançar AppError se usuário tentar desativar a si mesmo', () => {
      const target = { id: 2 };
      const requester = { id: 2, isSuperAdmin: false };

      expect(() => assertCanUpdateUser(target, requester, { active: false }, 2))
        .toThrowError('você não pode desativar sua própria conta');
    });

    it('deve lançar AppError se usuário tentar alterar sua própria role', () => {
      const target = { id: 2, role: 'ADMIN' };
      const requester = { id: 2, isSuperAdmin: false };

      expect(() => assertCanUpdateUser(target, requester, { role: 'WAITER' }, 2))
        .toThrowError('você não pode alterar sua própria role');
    });

    it('deve lançar AppError se não-superadmin tentar alterar role de outro admin', () => {
      const target = { id: 3, role: 'ADMIN' };
      const requester = { id: 2, role: 'ADMIN', isSuperAdmin: false };

      expect(() => assertCanUpdateUser(target, requester, { role: 'WAITER' }, 2))
        .toThrowError('apenas o superadmin pode alterar a role de um admin');
    });
  });

  describe('assertCanDeleteUser', () => {
    it('deve lançar AppError se tentar deletar a si mesmo', () => {
      const target = { id: 2 };
      const requester = { id: 2 };

      expect(() => assertCanDeleteUser(target, requester, 2, false))
        .toThrowError('você não pode deletar sua própria conta');
    });

    it('deve lançar AppError se tentar deletar superadmin', () => {
      const target = { id: 1, isSuperAdmin: true };
      const requester = { id: 2, isSuperAdmin: false };

      expect(() => assertCanDeleteUser(target, requester, 2, false))
        .toThrowError('o superadmin não pode ser deletado');
    });

    it('deve lançar AppError se tentar deletar conta demo sem ser superadmin', () => {
      const target = { id: 3, email: 'waiter@restaurant.com' };
      const requester = { id: 2, isSuperAdmin: false };

      expect(() => assertCanDeleteUser(target, requester, 2, false))
        .toThrowError('a conta de demonstração do garçom não pode ser deletada');
      expect(() => assertCanDeleteUser(target, requester, 2, true))
        .toThrowError('a conta de demonstração do garçom não pode ser deletada permanentemente');
    });

    it('deve lançar AppError se tentar deletar admin sem ser superadmin', () => {
      const target = { id: 3, role: 'ADMIN' };
      const requester = { id: 2, role: 'ADMIN', isSuperAdmin: false };

      expect(() => assertCanDeleteUser(target, requester, 2, false))
        .toThrowError('apenas o superadmin pode deletar um admin');
      expect(() => assertCanDeleteUser(target, requester, 2, true))
        .toThrowError('apenas o superadmin pode deletar permanentemente um admin');
    });
  });
});
