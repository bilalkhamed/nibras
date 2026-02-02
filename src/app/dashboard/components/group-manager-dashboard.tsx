import prisma from '@/lib/server/prisma';

export async function GroupManagerDashboard({ userId }: { userId: string }) {
  const groups = (
    await prisma.groupManager.findMany({
      where: {
        userId,
      },

      include: {
        group: true,
      },
    })
  ).map((gm) => gm.group);

  return (
    <section>
      <h1>مديرة مجموعات</h1>

      <ul>
        {groups.map((group) => (
          <li key={group.id}>{group.name}</li>
        ))}
      </ul>
    </section>
  );
}
