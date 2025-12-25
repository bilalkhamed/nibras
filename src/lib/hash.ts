import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { generateSixCharCode } from './utils';

const HMAC_SECRET = process.env.HMAC_SECRET || 'default_secret';

const NUM_DAYS_VALID = 7;

export async function hashPassword(unhashed: string) {
  const hashed = await bcrypt.hash(unhashed, 10);

  return hashed;
}

export async function comparePasswords(unhashed: string, hashed: string) {
  return bcrypt.compare(unhashed, hashed);
}

function hmacSha256(input: string) {
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(input, 'utf8')
    .digest('hex');
}

export function verifyHmacSha256(input: string, hash: string) {
  const inputHash = hmacSha256(input);
  return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(hash));
}

export function generateInvite() {
  const selector = generateSixCharCode();
  const validator = crypto.randomBytes(32).toString('hex');
  const validatorHash = hmacSha256(validator);
  const expiresAt = new Date(Date.now() + NUM_DAYS_VALID * 24 * 60 * 60 * 1000);

  return {
    selector,
    validator,
    validatorHash,
    fullCode: `${selector}.${validator}`,
    expiresAt,
  };
}
