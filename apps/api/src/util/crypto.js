import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getKey() {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'fallback-secret-key-for-simple-order-system';
  return crypto.createHash('sha256').update(secret).digest();
}

export function encrypt(text) {
  if (!text) return null;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${encrypted}:${authTag}`;
}

export function decrypt(encryptedText) {
  if (!encryptedText) return null;
  
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    return encryptedText;
  }
  
  try {
    const [ivHex, encryptedHex, authTagHex] = parts;
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('Decryption failed, returning plain value:', err.message);
    return encryptedText;
  }
}
