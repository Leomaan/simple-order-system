import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.number().int().positive().optional(),
  companyId: z.number().int().positive().optional(),
  name: z.string().min(2, 'O nome da categoria deve ter no mínimo 2 caracteres').max(50),
  slug: z.string().min(2).max(60).optional(),
  stationId: z.number().int().positive().nullable().optional(),
  orderIndex: z.number().int().default(0),
  active: z.boolean().default(true),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(2, 'O nome da categoria deve ter no mínimo 2 caracteres').max(50),
  stationId: z.number().int().positive().nullable().optional(),
  orderIndex: z.number().int().default(0).optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  active: z.boolean().optional(),
});
