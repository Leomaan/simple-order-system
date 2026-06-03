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