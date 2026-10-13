import { Company, ProductionStation, User } from '../models/index.js';
import { AppError } from '../middleware/appError.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function listCompanies() {
  return await Company.findAll({
    include: [
      {
        model: ProductionStation,
        attributes: ['id', 'name', 'slug', 'color', 'active'],
      },
      {
        model: User,
        attributes: ['id', 'name', 'email', 'role', 'active'],
        required: false,
      },
    ],
    order: [['createdAt', 'DESC']],
  });
}

export async function getCompanyById(id) {
  const company = await Company.findByPk(id, {
    include: [
      {
        model: ProductionStation,
        attributes: ['id', 'name', 'slug', 'color', 'active'],
      },
      {
        model: User,
        attributes: ['id', 'name', 'email', 'role', 'active'],
        required: false,
      },
    ],
  });

  if (!company) {
    throw new AppError('Empresa não encontrada', 404);
  }

  return company;
}

export async function getCompanyBySlug(slug) {
  const company = await Company.findOne({
    where: { slug, active: true },
    include: [
      {
        model: ProductionStation,
        where: { active: true },
        required: false,
        attributes: ['id', 'name', 'slug', 'color'],
      },
    ],
  });

  if (!company) {
    throw new AppError('Cardápio ou estabelecimento não encontrado', 404);
  }

  return company;
}

export async function createCompany(data, adminUserData = null) {
  const existing = await Company.findOne({ where: { slug: data.slug } });
  if (existing) {
    throw new AppError('Já existe uma empresa com este slug', 400);
  }

  const company = await Company.create(data);

  // Cria automaticamente as duas estações de produção padrão
  await ProductionStation.bulkCreate([
    {
      companyId: company.id,
      name: 'Cozinha',
      slug: 'cozinha',
      color: '#f97316', // Laranja
      active: true,
    },
    {
      companyId: company.id,
      name: 'Bar / Copa',
      slug: 'bar',
      color: '#06b6d4', // Ciano
      active: true,
    },
  ]);

  // Se foram fornecidos dados do usuário administrador da empresa, cria a conta vinculada
  let adminUser = null;
  if (adminUserData && adminUserData.email && adminUserData.password) {
    const existingUser = await User.findOne({ where: { email: adminUserData.email } });
    if (existingUser) {
      throw new AppError('Já existe um usuário cadastrado com este e-mail', 400);
    }

    const hashedPassword = await bcrypt.hash(adminUserData.password, 10);
    adminUser = await User.create({
      name: adminUserData.name || `Admin ${company.name}`,
      email: adminUserData.email,
      password: hashedPassword,
      role: 'ADMIN',
      companyId: company.id,
      isSuperAdmin: false,
      active: true,
    });
  }

  return {
    company,
    adminUser: adminUser ? { id: adminUser.id, email: adminUser.email, name: adminUser.name } : null,
  };
}

export async function updateCompany(id, data) {
  const company = await Company.findByPk(id);
  if (!company) {
    throw new AppError('Empresa não encontrada', 404);
  }

  if (data.slug && data.slug !== company.slug) {
    const existing = await Company.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw new AppError('Slug já utilizado por outra empresa', 400);
    }
  }

  await company.update(data);
  return company;
}

export async function toggleCompanyStatus(id) {
  const company = await Company.findByPk(id);
  if (!company) {
    throw new AppError('Empresa não encontrada', 404);
  }

  await company.update({ active: !company.active });
  return company;
}

export async function impersonateCompany(companyId, superAdminUser) {
  const company = await Company.findByPk(companyId);
  if (!company) {
    throw new AppError('Empresa não encontrada', 404);
  }

  // Gera um token de acesso administrativo com o companyId do tenant selecionado
  const token = jwt.sign(
    {
      userId: superAdminUser.userId || superAdminUser.id,
      name: `${superAdminUser.name} (Suporte: ${company.name})`,
      role: 'ADMIN',
      companyId: company.id,
      isSuperAdmin: true,
      impersonating: true,
      impersonatedCompany: {
        id: company.id,
        name: company.name,
        slug: company.slug,
      },
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return {
    accessToken: token,
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
    },
  };
}
