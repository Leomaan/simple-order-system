import { z } from 'zod';

export const createOrderSchema = z.object({
  table: z.number({ error: 'mesa é obrigatória e deve ser um número' }).int('mesa deve ser um número inteiro').positive('mesa deve ser um número positivo'),
});

export const updateOrderSchema = z.object({
  table:  z.number({ error: 'mesa deve ser um número' }).int().positive().optional(),
  status: z.enum(['OPEN', 'PAID', 'CLOSED'], { error: 'status deve ser OPEN, PAID ou CLOSED' }).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'nenhum dado fornecido',
});