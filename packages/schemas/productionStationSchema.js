import { z } from 'zod';

export const ProductionStationSchema = z.object({
  id: z.number().int().positive().optional(),
  companyId: z.number().int().positive().optional(),
  name: z.string().min(2, 'Nome do setor/estação deve ter no mínimo 2 caracteres'),
  slug: z.string()
    .min(2, 'Slug deve ter no mínimo 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Cor deve ser um código hexadecimal válido').default('#64748b'),
  active: z.boolean().default(true),
});

export const CreateProductionStationSchema = ProductionStationSchema.omit({ id: true, companyId: true });
export const UpdateProductionStationSchema = CreateProductionStationSchema.partial();
