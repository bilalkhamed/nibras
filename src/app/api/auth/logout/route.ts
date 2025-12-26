import { deleteAccessToken } from '@/lib/server/tokens';

export async function POST() {
  await deleteAccessToken();
  return new Response(null, {
    status: 204,
  });
}
