import { z } from 'zod';

export const createOrderItemSchema = z.object({
  orderId:   z.number({ error: 'orderId é obrigatório e deve ser um número' }).int().positive('orderId deve ser positivo'),
  productId: z.number({ error: 'productId é obrigatório e deve ser um número' }).int().positive('productId deve ser positivo'),
  quantity:  z.number({ error: 'quantidade é obrigatória e deve ser um número' }).int().positive('quantidade deve ser maior que 0'),
});

export const changeQuantitySchema = z.object({
  quantity: z.number({ error: 'quantidade é obrigatória e deve ser um número' }).int().positive('quantidade deve ser maior que 0'),
});