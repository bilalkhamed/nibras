import { cookies } from 'next/headers';
import { verifyAccessToken } from './tokens';
import { cache } from 'react';

const getAuthSession = cache(async () => {
  // console.log('Getting auth session...');
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload || typeof payload.userId !== 'string') {
    return null;
  }

  return payload;
});

export default getAuthSession;
