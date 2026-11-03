const SENSITIVE_KEYS = new Set([
  'password',
  'newPassword',
  'confirmPassword',
  'currentPassword',
  'token',
  'accessToken',
  'refreshToken',
  'mercadoPagoAccessToken',
]);

const DANGEROUS_PROTOCOLS = /^(javascript:|vbscript:|data:text\/html)/i;

/**
 * Sanitiza uma string removendo tags HTML, scripts e sequências maliciosas de XSS.
 * Preserva campos sensíveis como senhas e chaves de API intactos.
 */
export function sanitizeString(val, key = '') {
  if (typeof val !== 'string') return val;

  // Preserva senhas e tokens criptográficos exatamente como digitados
  if (SENSITIVE_KEYS.has(key)) {
    return val;
  }

  let clean = val;

  // Remove caracteres nulos (\0) que podem enganar parsers
  clean = clean.replace(/\0/g, '');

  // Remove blocos de script e style completos
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove qualquer tag HTML (ex: <img>, <iframe>, <a>, <div>, etc.)
  clean = clean.replace(/<[^>]+>/g, '');

  // Remove protocolos maliciosos de links ou URLs injetadas
  clean = clean.replace(DANGEROUS_PROTOCOLS, '');

  // Remove event handlers em texto (ex: onload=..., onerror=...)
  clean = clean.replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  return clean.trim();
}

/**
 * Percorre recursivamente objetos ou arrays aplicando sanitização sem sofrer prototype pollution.
 */
export function sanitizeData(data) {
  if (!data || typeof data !== 'object') {
    return typeof data === 'string' ? sanitizeString(data) : data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }

  const cleanObj = {};
  for (const [key, value] of Object.entries(data)) {
    // Bloqueia poluição de protótipo
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (typeof value === 'string') {
      cleanObj[key] = sanitizeString(value, key);
    } else if (value !== null && typeof value === 'object') {
      cleanObj[key] = sanitizeData(value);
    } else {
      cleanObj[key] = value;
    }
  }

  return cleanObj;
}

/**
 * Middleware Express para sanitização automática de body, query e params.
 */
export function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeData(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeData(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeData(req.params);
  }
  next();
}
