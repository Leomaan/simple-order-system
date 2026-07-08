import { z } from 'zod';

export const updateSettingsSchema = z.object({
  restaurantName: z.string().min(1, 'Nome do restaurante é obrigatório').optional(),
  mercadoPagoAccessToken: z.string().trim().nullable().optional(),
  mercadoPagoWebhookSecret: z.string().trim().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Nenhum dado fornecido' });
