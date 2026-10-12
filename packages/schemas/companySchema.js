import { z } from 'zod';

export const CompanyConfigSchema = z.object({
  permitirPedidoCliente: z.boolean().default(true),
  exigirAprovacaoGarcom: z.boolean().default(true),
  taxaServico: z.number().min(0).max(100).default(10),
  tempoAlertaKdsMinutos: z.number().min(1).default(15),
});

export const CreateCompanySchema = z.object({
  name: z.string().min(2, 'Nome da empresa deve ter no mínimo 2 caracteres'),
  slug: z.string()
    .min(2, 'Slug deve ter no mínimo 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  cnpj: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  logoUrl: z.string().url('URL da logo inválida').optional().nullable(),
  config: CompanyConfigSchema.partial().optional(),
});

export const UpdateCompanySchema = CreateCompanySchema.partial().extend({
  active: z.boolean().optional(),
});
