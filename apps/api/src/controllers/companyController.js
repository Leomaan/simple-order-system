import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as companyService from '../services/companyService.js';

export const listCompanies = asyncHandler(async (req, res) => {
  const companies = await companyService.listCompanies();
  res.status(200).json({ success: true, data: companies });
});

export const getCompanyById = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id);
  res.status(200).json({ success: true, data: company });
});

export const createCompany = asyncHandler(async (req, res) => {
  const { adminUser, ...companyData } = req.body;
  const result = await companyService.createCompany(companyData, adminUser);
  res.status(201).json({ success: true, data: result });
});

export const updateCompany = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(req.params.id, req.body);
  res.status(200).json({ success: true, data: company });
});

export const toggleCompanyStatus = asyncHandler(async (req, res) => {
  const company = await companyService.toggleCompanyStatus(req.params.id);
  res.status(200).json({ success: true, data: company });
});

export const impersonateCompany = asyncHandler(async (req, res) => {
  const result = await companyService.impersonateCompany(req.params.id, req.user);

  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', result.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? (process.env.COOKIE_SAME_SITE || 'none') : 'lax',
    maxAge: 2 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    data: {
      message: `Modo suporte ativado para ${result.company.name}`,
      company: result.company,
    },
  });
});

export const exitImpersonate = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cleanName = (req.user?.name || 'SuperAdmin').replace(/\s*\(Suporte:.*\)$/, '');
  
  const token = jwt.sign(
    {
      userId: req.user.userId || req.user.id,
      name: cleanName,
      role: 'ADMIN',
      companyId: null,
      isSuperAdmin: true,
      impersonating: false,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? (process.env.COOKIE_SAME_SITE || 'none') : 'lax',
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    data: { message: 'Modo suporte desativado com sucesso' },
  });
});
