import { z } from 'zod';

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