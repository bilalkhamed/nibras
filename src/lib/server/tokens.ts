import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AccessTokenPayload, Role, UserStatus } from '@/types/types';
import { SupervisorStatus } from '@prisma/client';

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error('SESSION_SECRET env var not set');
}
const encodedKey = new TextEncoder().encode(secretKey);

// Access token lives 15 minutes; adjust if needed.
const ACCESS_TOKEN_EXP_MINUTES = 60;

export async function setAccessToken(
  userId: string,
  role: Role,
  status: UserStatus,
  firstName: string,
  lastName: string,
  currentLevelId: string | null,
  activeGroupId: string | null,
  supervisedGroupId: string | null,
  managedCohortId: string | null,
  supervisorStatus: SupervisorStatus | null,
) {
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_EXP_MINUTES * 60 * 1000);
  const token = await signAccessToken({
    userId,
    role,
    status,
    firstName,
    lastName,
    expiresAt,
    currentLevelId,
    activeGroupId,
    supervisedGroupId,
    managedCohortId,
    supervisorStatus,
  });
  (await cookies()).set('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteAccessToken() {
  (await cookies()).delete('accessToken');
}

export async function signAccessToken(payload: AccessTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_EXP_MINUTES}m`)
    .sign(encodedKey);
}

export async function verifyAccessToken(token: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as AccessTokenPayload;
  } catch {
    return undefined;
  }
}

export const ACCESS_TOKEN_COOKIE = 'accessToken';
