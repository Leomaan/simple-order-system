import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listCompanies,
  getCompanyById,
  getCompanyBySlug,
  createCompany,
  toggleCompanyStatus,
  deleteCompany,
  impersonateCompany,
} from '../src/services/companyService.js';
import {
  sequelize,
  Company,
  ProductionStation,
  Category,
  Order,
  OrderItem,
  Product,
  User,
  RefreshToken,
  AuditLog,
  Settings,
} from '../src/models/index.js';
import { AppError } from '../src/middleware/appError.js';

vi.mock('../src/models/index.js', () => ({
  sequelize: {
    transaction: vi.fn((cb) => cb({})),
  },
  Company: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  },
  ProductionStation: {
    bulkCreate: vi.fn(),
    destroy: vi.fn(),
  },
  Category: {
    destroy: vi.fn(),
  },
  Order: {
    findAll: vi.fn(),
    destroy: vi.fn(),
  },
  OrderItem: {
    update: vi.fn(),
    destroy: vi.fn(),
  },
  Product: {
    destroy: vi.fn(),
  },
  User: {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
  RefreshToken: {
    destroy: vi.fn(),
  },
  AuditLog: {
    destroy: vi.fn(),
  },
  Settings: {
    destroy: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_pwd'),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock_jwt_token'),
  },
}));

beforeEach(() => vi.clearAllMocks());

describe('companyService', () => {
  describe('listCompanies', () => {
    it('deve listar todas as empresas', async () => {
      const companies = [{ id: 1, name: 'Pizzaria Bella', slug: 'bella' }];
      Company.findAll.mockResolvedValue(companies);

      const result = await listCompanies();
      expect(result).toEqual(companies);
      expect(Company.findAll).toHaveBeenCalledOnce();
    });
  });

  describe('getCompanyById', () => {
    it('deve retornar a empresa pelo ID', async () => {
      const company = { id: 1, name: 'Pizzaria Bella' };
      Company.findByPk.mockResolvedValue(company);

      const result = await getCompanyById(1);
      expect(result).toEqual(company);
    });

    it('deve lançar erro 404 se a empresa não existir', async () => {
      Company.findByPk.mockResolvedValue(null);

      await expect(getCompanyById(999)).rejects.toMatchObject({
        status: 404,
        message: 'Empresa não encontrada',
      });
    });
  });

  describe('getCompanyBySlug', () => {
    it('deve retornar empresa ativa pelo slug', async () => {
      const company = { id: 1, slug: 'bella', active: true };
      Company.findOne.mockResolvedValue(company);

      const result = await getCompanyBySlug('bella');
      expect(result).toEqual(company);
    });

    it('deve lançar erro 404 se slug não for encontrado ou inativo', async () => {
      Company.findOne.mockResolvedValue(null);

      await expect(getCompanyBySlug('desconhecido')).rejects.toMatchObject({
        status: 404,
        message: 'Cardápio ou estabelecimento não encontrado',
      });
    });
  });

  describe('createCompany', () => {
    it('deve criar uma nova empresa com estações padrão', async () => {
      Company.findOne.mockResolvedValue(null);
      const createdCompany = { id: 1, name: 'Café Teste', slug: 'cafe-teste' };
      Company.create.mockResolvedValue(createdCompany);
      ProductionStation.bulkCreate.mockResolvedValue([]);

      const result = await createCompany({ name: 'Café Teste', slug: 'cafe-teste' });

      expect(Company.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Café Teste', slug: 'cafe-teste' })
      );
      expect(ProductionStation.bulkCreate).toHaveBeenCalledOnce();
      expect(result.company).toEqual(createdCompany);
    });

    it('deve lançar erro se o slug já existir', async () => {
      Company.findOne.mockResolvedValue({ id: 1, slug: 'cafe-teste' });

      await expect(createCompany({ name: 'Outro', slug: 'cafe-teste' })).rejects.toMatchObject({
        status: 400,
        message: 'Já existe uma empresa com este slug',
      });
    });
  });

  describe('toggleCompanyStatus', () => {
    it('deve alternar status ativo/inativo', async () => {
      const company = {
        id: 1,
        active: true,
        update: vi.fn().mockImplementation(function (data) {
          this.active = data.active;
          return Promise.resolve(this);
        }),
      };
      Company.findByPk.mockResolvedValue(company);

      const result = await toggleCompanyStatus(1);

      expect(company.update).toHaveBeenCalledWith({ active: false });
      expect(result.active).toBe(false);
    });
  });

  describe('deleteCompany', () => {
    it('deve excluir permanentemente a empresa e seus registros vinculados', async () => {
      const company = {
        id: 1,
        name: 'Pizzaria Bella',
        destroy: vi.fn().mockResolvedValue(true),
      };
      Company.findByPk.mockResolvedValue(company);
      User.findAll.mockResolvedValue([{ id: 5 }]);
      Order.findAll.mockResolvedValue([{ id: 12 }]);

      const result = await deleteCompany(1);

      expect(RefreshToken.destroy).toHaveBeenCalled();
      expect(OrderItem.destroy).toHaveBeenCalled();
      expect(Order.destroy).toHaveBeenCalled();
      expect(Product.destroy).toHaveBeenCalled();
      expect(Category.destroy).toHaveBeenCalled();
      expect(ProductionStation.destroy).toHaveBeenCalled();
      expect(User.destroy).toHaveBeenCalled();
      expect(company.destroy).toHaveBeenCalledWith(expect.objectContaining({ force: true }));
      expect(result).toEqual({ id: 1, name: 'Pizzaria Bella' });
    });

    it('deve lançar erro 404 ao tentar excluir empresa inexistente', async () => {
      Company.findByPk.mockResolvedValue(null);

      await expect(deleteCompany(999)).rejects.toMatchObject({
        status: 404,
        message: 'Empresa não encontrada',
      });
    });
  });

  describe('impersonateCompany', () => {
    it('deve gerar token de suporte para superadmin', async () => {
      const company = { id: 1, name: 'Pizzaria Bella', slug: 'bella', active: true };
      Company.findByPk.mockResolvedValue(company);

      const superadminUser = { id: 10, isSuperAdmin: true, name: 'Master' };
      const result = await impersonateCompany(1, superadminUser);

      expect(result.company).toEqual(expect.objectContaining({ id: 1, name: 'Pizzaria Bella' }));
      expect(result.accessToken).toBe('mock_jwt_token');
    });

    it('deve lançar 404 se a empresa a ser acessada não existir', async () => {
      Company.findByPk.mockResolvedValue(null);

      await expect(impersonateCompany(999, { id: 10 })).rejects.toMatchObject({
        status: 404,
        message: 'Empresa não encontrada',
      });
    });
  });
});
