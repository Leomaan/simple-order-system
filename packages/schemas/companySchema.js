import { z } from 'zod';

export const CompanyConfigSchema = z.object({
  permitirPedidoCliente: z.boolean().default(true),
  exigirAprovacaoGarcom: z.boolean().default(true),
  taxaServico: z.number().min(0).max(100).default(10),
  tempoAlertaKdsMinutos: z.number().min(1).default(15),
});

export const AdminUserSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().email('E-mail do administrador inválido'),
  password: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres'),
});

export const CreateCompanySchema = z.object({
  name: z.string().min(2, 'Nome da empresa deve ter no mínimo 2 caracteres'),
  slug: z.string()
    .min(2, 'Slug deve ter no mínimo 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  cnpj: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  logoUrl: z.string().url('URL da logo inválida').optional().nullable().or(z.literal('')),
  config: CompanyConfigSchema.partial().optional(),
  adminUser: AdminUserSchema.optional().nullable(),
});

export const UpdateCompanySchema = CreateCompanySchema.partial().extend({
  active: z.boolean().optional(),
});
