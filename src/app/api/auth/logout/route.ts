import { deleteAccessToken } from '@/lib/tokens';

export async function POST() {
  await deleteAccessToken();
  return new Response(null, {
    status: 204,
  });
}
