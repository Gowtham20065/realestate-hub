import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthUserPayload } from '../types/auth.types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'supersecretjwtkey_change_in_production_123456789';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload: AuthUserPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): AuthUserPayload => {
  return jwt.verify(token, JWT_SECRET) as AuthUserPayload;
};
