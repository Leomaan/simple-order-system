import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAll, findById, createProduct, updateProduct, deleteProduct, permanentDeleteProduct, restoreProduct } from '../src/services/productService.js';
import Product from '../src/models/product.js';
import { AppError } from '../src/middleware/appError.js';

vi.mock('../src/models/product.js', () => ({
  default: {
    findAll: vi.fn(),
    findOne: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
  }
}));

vi.mock('../src/models/category.js', () => ({
  default: {
    findByPk: vi.fn(),
  }
}));

// Mock simplificado do DTO para o ambiente de testes
vi.mock('../src/dto/productDto.js', () => ({
  formatProductDto: vi.fn((product) => {
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      category: product.category || 'FOOD',
      categoryId: product.categoryId || null,
      available: product.available ?? true,
    };
  })
}));

beforeEach(() => vi.clearAllMocks());

describe('findAll', () => {
  it('deve retornar todos os produtos', async () => {
    const products = [{ id: 1, name: 'X-Burguer', price: 25.90, category: 'FOOD' }];
    Product.findAll.mockResolvedValue(products);

    const result = await findAll();

    expect(result).toEqual([
      expect.objectContaining({ id: 1, name: 'X-Burguer' })
    ]);
    expect(Product.findAll).toHaveBeenCalledOnce();
  });

  it('deve filtrar produtos por categoria dinâmica', async () => {
    const drinks = [{ id: 2, name: 'Suco', category: 'DRINK', price: 8.00 }];
    Product.findAll.mockResolvedValue(drinks);

    const result = await findAll('DRINK');

    expect(result).toEqual([
      expect.objectContaining({ id: 2, name: 'Suco', category: 'DRINK' })
    ]);
    expect(Product.findAll).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.any(Object),
      order: [['name', 'ASC']]
    }));
  });

  it('deve permitir categorias customizadas sem lançar erro de enum fixo', async () => {
    Product.findAll.mockResolvedValue([]);
    await expect(findAll('CAFES_ESPECIAIS')).resolves.not.toThrow();
  });
});

describe('findById', () => {
  it('deve retornar o produto pelo id', async () => {
    const product = { id: 1, name: 'X-Burguer', price: 25.90, category: 'FOOD' };
    Product.findOne.mockResolvedValue(product);

    const result = await findById(1);

    expect(result).toEqual(expect.objectContaining({ id: 1, name: 'X-Burguer' }));
  });

  it('deve lançar AppError 404 se produto não existir', async () => {
    Product.findOne.mockResolvedValue(null);

    await expect(findById(99)).rejects.toThrow(AppError);
    await expect(findById(99)).rejects.toMatchObject({ status: 404, message: 'product not found' });
  });
});

describe('createProduct', () => {
  it('deve criar um produto com sucesso', async () => {
    const data = { name: 'X-Burguer', price: 25.90, category: 'FOOD' };
    Product.findOne.mockResolvedValue(null);
    Product.create.mockResolvedValue({ id: 1, ...data });
    Product.findByPk.mockResolvedValue({ id: 1, ...data });

    const result = await createProduct(data);

    expect(result).toMatchObject({ id: 1, name: 'X-Burguer' });
    expect(Product.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'X-Burguer',
      price: 25.90,
    }));
  });

  it('deve lançar AppError se nome não for fornecido', async () => {
    await expect(createProduct({ price: 25.90 })).rejects.toMatchObject({ message: 'no data provided' });
  });

  it('deve lançar AppError se produto já existir', async () => {
    Product.findOne.mockResolvedValue({ id: 1, name: 'X-Burguer' });

    await expect(createProduct({ name: 'X-Burguer', price: 25.90 })).rejects.toMatchObject({
      message: 'product already exists',
    });
  });
});

describe('updateProduct', () => {
  it('deve atualizar um produto com sucesso', async () => {
    const product = { id: 1, name: 'X-Burguer', update: vi.fn().mockResolvedValue(true) };
    Product.findOne.mockResolvedValue(product);
    Product.findByPk.mockResolvedValue({ id: 1, name: 'X-Burguer Duplo' });

    await updateProduct(1, { name: 'X-Burguer Duplo' });

    expect(product.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'X-Burguer Duplo' }));
  });

  it('deve atualizar a categoria do produto', async () => {
    const product = { id: 1, category: 'FOOD', update: vi.fn().mockResolvedValue(true) };
    Product.findOne.mockResolvedValue(product);
    Product.findByPk.mockResolvedValue({ id: 1, category: 'SNACK' });

    await updateProduct(1, { category: 'SNACK' });

    expect(product.update).toHaveBeenCalledWith(expect.objectContaining({ category: 'SNACK' }));
  });

  it('deve lançar AppError se nenhum dado for fornecido', async () => {
    await expect(updateProduct(1, {})).rejects.toMatchObject({ message: 'no data provided' });
  });

  it('deve lançar AppError 404 se produto não existir', async () => {
    Product.findOne.mockResolvedValue(null);

    await expect(updateProduct(99, { name: 'X-Burguer' })).rejects.toMatchObject({ status: 404 });
  });
});

describe('deleteProduct', () => {
  it('deve deletar um produto com sucesso', async () => {
    const product = { 
      id: 1, 
      destroy: vi.fn().mockResolvedValue(true) 
    };
    Product.findOne.mockResolvedValue(product);

    await deleteProduct(1);

    expect(product.destroy).toHaveBeenCalledOnce();
  });

  it('deve lançar AppError 404 se produto não existir', async () => {
    Product.findOne.mockResolvedValue(null);

    await expect(deleteProduct(99)).rejects.toMatchObject({ status: 404, message: 'product not found' });
  });
});

describe('restoreProduct', () => {
  it('deve restaurar um produto com sucesso', async () => {
    const product = { id: 1, restore: vi.fn().mockResolvedValue(true) };
    Product.findOne.mockResolvedValue(product);

    await restoreProduct(1);

    expect(product.restore).toHaveBeenCalledOnce();
  });
});

describe('permanentDeleteProduct', () => {
  it('deve deletar permanentemente um produto', async () => {
    const product = { id: 1, destroy: vi.fn().mockResolvedValue(true) };
    Product.findOne.mockResolvedValue(product);

    await permanentDeleteProduct(1);

    expect(product.destroy).toHaveBeenCalledWith({ force: true });
  });
});