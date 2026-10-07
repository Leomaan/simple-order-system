/**
 * Configuração centralizada e dinâmica de CORS.
 * Responsabilidade Única: Validar e permitir origens seguras (Vercel, Render, Localhost).
 */
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const devOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

export const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem header origin (Postman, chamadas de servidor, etc)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');

    const isAllowed =
      allowedOrigins.includes(cleanOrigin) ||
      (!isProduction && devOrigins.includes(cleanOrigin));

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN', 'X-Requested-With'],
};

export default corsOptions;
