import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listCompanies,
  getCompanyById,
  getCompanyBySlug,
  createCompany,
  toggleCompanyStatus,
  impersonateCompany,
} from '../src/services/companyService.js';
import { Company, ProductionStation, User } from '../src/models/index.js';
import { AppError } from '../src/middleware/appError.js';

vi.mock('../src/models/index.js', () => ({
  Company: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  },
  ProductionStation: {
    bulkCreate: vi.fn(),
  },
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
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
