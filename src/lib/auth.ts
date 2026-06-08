import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import { User, AuthToken } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

const ALGORITHM = 'HS256';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = async (user: User): Promise<string> => {
  const token = await jose.SignJWT({
    userId: user.id,
    email: user.email,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return token;
};

export const verifyToken = async (token: string): Promise<AuthToken | null> => {
  try {
    const verified = await jose.jwtVerify(token, JWT_SECRET);
    return verified.payload as AuthToken;
  } catch (error) {
    return null;
  }
};

export const generateOTP = (): string => {
  return Math.random().toString().slice(2, 8).padStart(6, '0');
};
