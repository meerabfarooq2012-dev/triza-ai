import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { randomBytes, createHmac } from 'crypto';

const ISSUER = 'Thiora';

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(userEmail: string, userId: string): { secret: string; totp: OTPAuth.TOTP } {
  const secretBytes = randomBytes(20);
  const secret = secretBytes.toString('hex');
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromHex(secret),
  });

  return { secret, totp };
}

/**
 * Generate QR code data URL for TOTP setup
 */
export async function generateQRCode(totp: OTPAuth.TOTP): Promise<string> {
  const uri = totp.toString();
  return QRCode.toDataURL(uri, { width: 256, margin: 2 });
}

/**
 * Verify a TOTP code against a secret
 */
export function verifyTOTP(secret: string, code: string): boolean {
  try {
    const totp = new OTPAuth.TOTP({
      issuer: ISSUER,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromHex(secret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
  } catch {
    return false;
  }
}

/**
 * Generate backup codes (8 codes)
 */
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    codes.push(randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

/**
 * Hash a backup code for storage (we compare against hashed versions)
 */
export function hashBackupCode(code: string): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('FATAL: JWT_SECRET environment variable is not set')
  return createHmac('sha256', secret)
    .update(code)
    .digest('hex');
}

/**
 * Verify a backup code against the stored hashed codes
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.includes(hashedInput);
}
