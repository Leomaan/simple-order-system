import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findAll, findById, createProduct, updateProduct, deleteProduct } from '../src/services/productService.js';
import Product from '../src/models/product.js';
import { AppError } from '../src/middleware/appError.js';

vi.mock('../src/models/product.js', () => ({
  default: {
    findAll:   vi.fn(),
    findByPk:  vi.fn(),
    findOne:   vi.fn(),
    create:    vi.fn(),
  }
}));

beforeEach(() => vi.clearAllMocks());

describe('findAll', () => {
  it('deve retornar todos os produtos', async () => {
    const products = [{ id: 1, name: 'X-Burguer' }];
    Product.findAll.mockResolvedValue(products);

    const result = await findAll();

    expect(result).toEqual(products);
    expect(Product.findAll).toHaveBeenCalledOnce();
  });
});

describe('findById', () => {
  it('deve retornar o produto pelo id', async () => {
    const product = { id: 1, name: 'X-Burguer' };
    Product.findByPk.mockResolvedValue(product);

    const result = await findById(1);

    expect(result).toEqual(product);
  });

  it('deve lançar AppError 404 se produto não existir', async () => {
    Product.findByPk.mockResolvedValue(null);

    await expect(findById(99)).rejects.toThrow(AppError);
    await expect(findById(99)).rejects.toMatchObject({ status: 404, message: 'product not found' });
  });
});

describe('createProduct', () => {
  it('deve criar um produto com sucesso', async () => {
    const data = { name: 'X-Burguer', price: 25.90 };
    Product.findOne.mockResolvedValue(null);
    Product.create.mockResolvedValue({ id: 1, ...data });

    const result = await createProduct(data);

    expect(result).toMatchObject({ id: 1, name: 'X-Burguer' });
    expect(Product.create).toHaveBeenCalledWith(data);
  });

  it('deve lançar AppError se nome não for fornecido', async () => {
    await expect(createProduct({ price: 25.90 })).rejects.toThrow(AppError);
    await expect(createProduct({ price: 25.90 })).rejects.toMatchObject({ message: 'no data provided' });
  });

  it('deve lançar AppError se produto já existir', async () => {
    Product.findOne.mockResolvedValue({ id: 1, name: 'X-Burguer' });

    await expect(createProduct({ name: 'X-Burguer', price: 25.90 })).rejects.toThrow(AppError);
    await expect(createProduct({ name: 'X-Burguer', price: 25.90 })).rejects.toMatchObject({ message: 'product already exists' });
  });
});

describe('updateProduct', () => {
  it('deve atualizar um produto com sucesso', async () => {
    const product = { id: 1, name: 'X-Burguer', update: vi.fn().mockResolvedValue(true) };
    Product.findByPk.mockResolvedValue(product);

    const result = await updateProduct(1, { name: 'X-Burguer Duplo' });

    expect(product.update).toHaveBeenCalledWith({ name: 'X-Burguer Duplo' });
  });

  it('deve lançar AppError se nenhum dado for fornecido', async () => {
    await expect(updateProduct(1, {})).rejects.toThrow(AppError);
    await expect(updateProduct(1, {})).rejects.toMatchObject({ message: 'no data provided' });
  });

  it('deve lançar AppError 404 se produto não existir', async () => {
    Product.findByPk.mockResolvedValue(null);

    await expect(updateProduct(99, { name: 'X-Burguer' })).rejects.toMatchObject({ status: 404 });
  });
});

describe('deleteProduct', () => {
  it('deve deletar um produto com sucesso', async () => {
    const product = { id: 1, destroy: vi.fn().mockResolvedValue(true) };
    Product.findByPk.mockResolvedValue(product);

    await deleteProduct(1);

    expect(product.destroy).toHaveBeenCalledOnce();
  });

  it('deve lançar AppError 404 se produto não existir', async () => {
    Product.findByPk.mockResolvedValue(null);

    await expect(deleteProduct(99)).rejects.toMatchObject({ status: 404, message: 'product not found' });
  });
});