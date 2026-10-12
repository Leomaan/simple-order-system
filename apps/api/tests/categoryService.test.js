import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../src/services/categoryService.js';
import { Category, Product } from '../src/models/index.js';
import { AppError } from '../src/middleware/appError.js';

vi.mock('../src/models/index.js', () => ({
  Category: {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create:  vi.fn(),
  },
  ProductionStation: {},
  Product: {
    update: vi.fn(),
  },
}));

beforeEach(() => vi.clearAllMocks());

describe('categoryService', () => {
  describe('listCategories', () => {
    it('deve listar categorias da empresa ordenadas', async () => {
      const mockCategories = [
        { id: 1, name: 'Bebidas', orderIndex: 0 },
        { id: 2, name: 'Pizzas', orderIndex: 1 },
      ];
      Category.findAll.mockResolvedValue(mockCategories);

      const result = await listCategories(10);

      expect(Category.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 10, active: true },
        })
      );
      expect(result).toEqual(mockCategories);
    });
  });

  describe('createCategory', () => {
    it('deve criar uma categoria gerando o slug normalizado', async () => {
      const data = { name: 'Cafés Especiais', orderIndex: 2 };
      Category.create.mockImplementation((payload) => Promise.resolve({ id: 5, ...payload }));

      const result = await createCategory(10, data);

      expect(Category.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Cafés Especiais',
          slug: 'cafes-especiais',
          companyId: 10,
        })
      );
      expect(result.slug).toBe('cafes-especiais');
    });
  });

  describe('updateCategory', () => {
    it('deve atualizar o nome e recalcular o slug', async () => {
      const existing = {
        id: 5,
        name: 'Cafés',
        slug: 'cafes',
        companyId: 10,
        update: vi.fn().mockResolvedValue(true),
      };
      Category.findOne.mockResolvedValue(existing);

      await updateCategory(10, 5, { name: 'Cafés Gelados' });

      expect(existing.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Cafés Gelados',
          slug: 'cafes-gelados',
        })
      );
    });

    it('deve lançar 404 se a categoria não pertencer à empresa', async () => {
      Category.findOne.mockResolvedValue(null);

      await expect(updateCategory(10, 999, { name: 'Inexistente' })).rejects.toMatchObject({
        status: 404,
        message: 'Categoria não encontrada',
      });
    });
  });

  describe('deleteCategory', () => {
    it('deve desvincular produtos antes de deletar a categoria', async () => {
      const existing = {
        id: 5,
        companyId: 10,
        destroy: vi.fn().mockResolvedValue(true),
      };
      Category.findOne.mockResolvedValue(existing);
      Product.update.mockResolvedValue([2]);

      const result = await deleteCategory(10, 5);

      expect(Product.update).toHaveBeenCalledWith(
        { categoryId: null },
        { where: { categoryId: 5 } }
      );
      expect(existing.destroy).toHaveBeenCalledOnce();
      expect(result).toEqual({ success: true });
    });

    it('deve lançar erro 404 ao tentar excluir categoria inexistente', async () => {
      Category.findOne.mockResolvedValue(null);

      await expect(deleteCategory(10, 999)).rejects.toMatchObject({
        status: 404,
        message: 'Categoria não encontrada',
      });
    });
  });
});
