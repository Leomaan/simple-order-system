export function getMenuCanonicalUrl(slug = '') {
  const origin = window?.location?.origin || '';
  if (!slug) {
    return `${origin}/cardapio`;
  }
  return `${origin}/cardapio/${encodeURIComponent(slug)}`;
}

export function generateQrCodeImageUrl(url, size = 220) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&format=svg`;
}
