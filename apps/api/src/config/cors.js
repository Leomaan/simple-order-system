/**
 * Configuração centralizada e dinâmica de CORS.
 * Responsabilidade Única: Validar e permitir origens seguras (Vercel, Render, Localhost).
 */
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

export const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem header origin (Postman, chamadas de servidor, etc)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, '');

    // Permite se a origem estiver configurada no FRONTEND_URL, ou se for um subdomínio da Vercel (*.vercel.app), ou dev local
    const isAllowed =
      allowedOrigins.length === 0 ||
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin === 'http://localhost:5173' ||
      cleanOrigin === 'http://localhost:3000';

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
