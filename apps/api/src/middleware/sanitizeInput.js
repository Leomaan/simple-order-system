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
 * Sanitiza objetos ou arrays in-place (mutação direta nas chaves).
 * Compatível com Express 5 onde req.query e req.params são propriedades getter-only.
 */
export function sanitizeInPlace(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string') {
        obj[i] = sanitizeString(obj[i]);
      } else if (obj[i] !== null && typeof obj[i] === 'object') {
        sanitizeInPlace(obj[i]);
      }
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    // Bloqueia poluição de protótipo
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      delete obj[key];
      continue;
    }

    const value = obj[key];
    if (typeof value === 'string') {
      obj[key] = sanitizeString(value, key);
    } else if (value !== null && typeof value === 'object') {
      sanitizeInPlace(value);
    }
  }

  return obj;
}

/**
 * Middleware Express para sanitização automática de body, query e params.
 * Não reatribui req.query / req.params diretamente para suportar o Express 5.
 */
export function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitizeInPlace(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeInPlace(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    sanitizeInPlace(req.params);
  }
  next();
}
