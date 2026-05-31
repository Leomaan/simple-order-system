import { z } from 'zod';

const CATEGORIES = ['FOOD', 'DRINK', 'SNACK', 'DESSERT', 'SIDE'];
 
export const createProductSchema = z.object({
  name:        z.string({ error: 'nome é obrigatório' }).min(1, 'nome não pode ser vazio'),
  price:       z.number({ error: 'preço é obrigatório e deve ser um número' }).positive('preço deve ser positivo'),
  description: z.string().optional(),
  available:   z.boolean().optional(),
  category:    z.enum(CATEGORIES, { error: `categoria deve ser: ${CATEGORIES.join(', ')}` }),
});
 
export const updateProductSchema = z.object({
  name:        z.string({ error: 'nome deve ser uma string' }).min(1, 'nome não pode ser vazio').optional(),
  price:       z.number({ error: 'preço deve ser um número' }).positive('preço deve ser positivo').optional(),
  description: z.string().optional(),
  available:   z.boolean({ error: 'disponibilidade deve ser verdadeiro ou falso' }).optional(),
  category:    z.enum(CATEGORIES, { error: `categoria deve ser: ${CATEGORIES.join(', ')}` }).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'nenhum dado fornecido',
});

export const createOrderSchema = z.object({
  table: z.number({ error: 'mesa é obrigatória e deve ser um número' }).int('mesa deve ser um número inteiro').positive('mesa deve ser um número positivo'),
});

export const updateOrderSchema = z.object({
  table:  z.number({ error: 'mesa deve ser um número' }).int().positive().optional(),
  status: z.enum(['OPEN', 'PAID', 'CLOSED'], { error: 'status deve ser OPEN, PAID ou CLOSED' }).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'nenhum dado fornecido',
});

export const createOrderItemSchema = z.object({
  orderId:   z.number({ error: 'orderId é obrigatório e deve ser um número' }).int().positive('orderId deve ser positivo'),
  productId: z.number({ error: 'productId é obrigatório e deve ser um número' }).int().positive('productId deve ser positivo'),
  quantity:  z.number({ error: 'quantidade é obrigatória e deve ser um número' }).int().positive('quantidade deve ser maior que 0'),
});

export const changeQuantitySchema = z.object({
  quantity: z.number({ error: 'quantidade é obrigatória e deve ser um número' }).int().positive('quantidade deve ser maior que 0'),
});

export const createUserSchema = z.object({
  name:     z.string({ error: 'nome é obrigatório' }).min(1),
  email:    z.string({ error: 'email é obrigatório' }).email('email inválido'),
  password: z.string({ error: 'senha é obrigatória' }).min(6, 'senha deve ter no mínimo 6 caracteres'),
  role:     z.enum(['ADMIN', 'WAITER'], { error: 'role deve ser ADMIN ou WAITER' }),
});

export const updateUserSchema = z.object({
  name:   z.string().min(1).optional(),
  role:   z.enum(['ADMIN', 'WAITER']).optional(),
  active: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'nenhum dado fornecido' });

export const loginSchema = z.object({
  email:    z.string({ error: 'email é obrigatório' }).email('email inválido'),
  password: z.string({ error: 'senha é obrigatória' }).min(6, 'senha deve ter no mínimo 6 caracteres'),
});
 
export const refreshSchema = z.object({
  refreshToken: z.string({ error: 'refresh token é obrigatório' }),
});