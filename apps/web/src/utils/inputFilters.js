/**
 * Dynamic input filters and sanitizers for Simple Order
 * Provides real-time masks, normalization, and validations.
 */

// 1. CNPJ: 00.000.000/0001-00 (max 14 digits)
export function filterCnpj(value) {
  if (value === null || value === undefined) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

// 2. Telefone / WhatsApp: (11) 99999-9999 or (11) 9999-9999 (max 11 digits)
export function filterPhone(value) {
  if (value === null || value === undefined) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

// 3. Slug: lower-case kebab-case (a-z0-9-)
export function filterSlug(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[\s_]+/g, '-')         // replace spaces and underscores with hyphen
    .replace(/[^a-z0-9-]/g, '')      // strip special characters and punctuation
    .replace(/-+/g, '-');            // collapse multiple hyphens
}

// 4. Numbers / Integer only (e.g. table number, order index, quantity)
export function filterNumber(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\D/g, '');
}

// 5. Decimal / Currency (e.g. price 12.50)
export function filterDecimal(value) {
  if (value === null || value === undefined) return '';
  let clean = String(value).replace(/[^0-9.,]/g, '').replace(',', '.');
  const parts = clean.split('.');
  if (parts.length > 2) {
    clean = `${parts[0]}.${parts.slice(1).join('')}`;
  }
  return clean;
}

// 6. Currency formatted as BRL (R$ 0,00)
export function filterCurrency(value) {
  if (value === null || value === undefined) return '';
  const digits = String(value).replace(/\D/g, '');
  if (!digits) return '';
  const num = Number(digits) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 7. Email: lowercase, no spaces
export function filterEmail(value) {
  if (value === null || value === undefined) return '';
  return String(value).toLowerCase().replace(/\s/g, '');
}

// 8. Clean text / Name: prevents multiple spaces, trims leading spaces
export function filterText(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
}

// Map of filter names to functions
export const FILTER_RESOLVERS = {
  cnpj: filterCnpj,
  phone: filterPhone,
  telefone: filterPhone,
  slug: filterSlug,
  number: filterNumber,
  integer: filterNumber,
  digits: filterNumber,
  decimal: filterDecimal,
  currency: filterCurrency,
  money: filterCurrency,
  email: filterEmail,
  text: filterText,
  name: filterText,
};

/**
 * Apply a specified filter to a given input value
 */
export function applyFilter(filter, value) {
  if (!filter) return value;
  if (typeof filter === 'function') return filter(value);
  const fn = FILTER_RESOLVERS[String(filter).toLowerCase()];
  return fn ? fn(value) : value;
}

/**
 * Automatically detects the appropriate filter based on field attributes
 */
export function detectFilter({ filter, name, type, id }) {
  if (filter !== undefined && filter !== null) return filter;
  const n = (name || id || '').toLowerCase();
  if (n.includes('cnpj')) return 'cnpj';
  if (n.includes('phone') || n.includes('telefone') || n.includes('celular') || n.includes('whatsapp')) return 'phone';
  if (n.includes('slug')) return 'slug';
  if (type === 'email' || n.includes('email')) return 'email';
  if (n === 'table' || n === 'mesa') return 'number';
  if (n.includes('price') || n.includes('preco') || n.includes('valor')) return 'decimal';
  return null;
}
