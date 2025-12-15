import prisma from '@/lib/prisma';

const user = await prisma.user.findFirst();

console.log(user);
