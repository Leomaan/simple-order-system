import { z } from 'zod';

export const createOrderSchema = z.object({
  table: z.number({ error: 'mesa é obrigatória e deve ser um número' }).int('mesa deve ser um número inteiro').positive('mesa deve ser um número positivo'),
});

export const updateOrderSchema = z.object({
  table: z.number({ error: 'mesa deve ser um número' }).int('mesa deve ser um número inteiro').positive('mesa deve ser um número positivo'),
});