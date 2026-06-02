import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string({ error: 'email é obrigatório' }).email('email inválido'),
  password: z.string({ error: 'senha é obrigatória' }).min(6, 'senha deve ter no mínimo 6 caracteres'),
});
 
export const refreshSchema = z.object({
  refreshToken: z.string({ error: 'refresh token é obrigatório' }),
});