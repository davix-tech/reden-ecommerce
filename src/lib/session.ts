import { cookies } from 'next/headers';
import { verifyToken, AuthToken } from './auth';

const AUTH_COOKIE_NAME = 'auth_token';
const SESSION_COOKIE_NAME = 'session_id';

export const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
};

export const getCurrentUser = async (): Promise<AuthToken | null> => {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
};

export const setAuthCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
};

export const clearAuthCookie = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
};

export const getOrCreateSessionId = async (): Promise<string> => {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });
  }
  
  return sessionId;
};
