import prisma from '@/lib/prisma';

export default async function TestPage() {
  const user = await prisma.user.findFirst();
  console.log('prisma:', prisma);
  return <div>{user?.name}</div>;
}
