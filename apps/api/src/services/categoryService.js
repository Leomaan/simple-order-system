import { Category, ProductionStation, Product } from '../models/index.js';
import { AppError } from '../middleware/appError.js';

export async function listCategories(companyId) {
  return await Category.findAll({
    where: { companyId, active: true },
    include: [
      {
        model: ProductionStation,
        attributes: ['id', 'name', 'slug', 'color'],
      },
    ],
    order: [
      ['orderIndex', 'ASC'],
      ['name', 'ASC'],
    ],
  });
}

export async function createCategory(companyId, data) {
  const slug = (data.name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  return await Category.create({
    ...data,
    slug,
    companyId,
  });
}

export async function updateCategory(companyId, id, data) {
  const category = await Category.findOne({ where: { id, companyId } });
  if (!category) throw new AppError('Categoria não encontrada', 404);

  let slug = category.slug;
  if (data.name && data.name !== category.name) {
    slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
  }

  await category.update({
    ...data,
    slug,
  });

  return category;
}

export async function deleteCategory(companyId, id) {
  const category = await Category.findOne({ where: { id, companyId } });
  if (!category) throw new AppError('Categoria não encontrada', 404);

  // Desvincula produtos desta categoria antes de apagar
  await Product.update({ categoryId: null }, { where: { categoryId: id } });
  await category.destroy();

  return { success: true };
}
