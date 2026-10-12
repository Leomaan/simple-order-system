import Product from '../models/product.js';
import Company from '../models/company.js';
import { formatPublicProductDto } from '../dto/publicProductDto.js';
import { AppError } from '../middleware/appError.js';

const PUBLIC_PRODUCT_ATTRIBUTES = ['id', 'name', 'price', 'description', 'imageUrl', 'category', 'available', 'stationId'];

export async function getPublicMenuProducts(companySlug = null) {
  let company = null;
  let dynamicCategories = [];
  const where = {
    available: true,
  };

  if (companySlug) {
    company = await Company.findOne({
      where: { slug: companySlug, active: true },
      attributes: ['id', 'name', 'slug', 'logoUrl', 'config'],
    });

    if (!company) {
      throw new AppError('Cardápio do estabelecimento não encontrado ou inativo', 404);
    }

    where.companyId = company.id;

    // Busca categorias dinâmicas cadastradas pelo estabelecimento
    const { Category } = await import('../models/index.js');
    dynamicCategories = await Category.findAll({
      where: { companyId: company.id, active: true },
      order: [['orderIndex', 'ASC'], ['name', 'ASC']],
      attributes: ['id', 'name', 'slug'],
      raw: true,
    });
  }

  const products = await Product.findAll({
    attributes: PUBLIC_PRODUCT_ATTRIBUTES,
    where,
    order: [
      ['name', 'ASC'],
    ],
    raw: true,
  });

  return {
    company: company ? {
      name: company.name,
      slug: company.slug,
      logoUrl: company.logoUrl,
      config: company.config,
    } : null,
    categories: dynamicCategories,
    products: products.map(formatPublicProductDto),
  };
}
