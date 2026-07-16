import crypto from 'crypto';

export function verifyMercadoPagoSignature(headers, query, body, secret) {
  if (!secret) {
    console.warn('[Webhook Warning] Webhook secret not configured. Skipping signature verification.');
    return true;
  }

  const xSignature = headers['x-signature'];
  const xRequestId = headers['x-request-id'];

  if (!xSignature) {
    console.warn('[Webhook Warning] x-signature header is missing.');
    return false;
  }

  try {
    const tsMatch = xSignature.match(/ts=(\d+)/);
    const v1Match = xSignature.match(/v1=([a-f0-9]+)/);

    if (!tsMatch || !v1Match) {
      console.warn('[Webhook Warning] Malformed x-signature header.');
      return false;
    }

    const ts = tsMatch[1];
    const v1 = v1Match[1];

    const dataId = query['data.id'] || body?.data?.id;
    if (!dataId) {
      console.warn('[Webhook Warning] data.id missing from webhook payload.');
      return false;
    }

    const manifest = `id:${String(dataId).toLowerCase()};request-id:${xRequestId || ''};ts:${ts};`;

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const expectedSignature = hmac.digest('hex');

    const v1Buffer = Buffer.from(v1, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (v1Buffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(v1Buffer, expectedBuffer);
  } catch (err) {
    console.error('[Webhook Error] Exception during signature verification:', err.message);
    return false;
  }
}
