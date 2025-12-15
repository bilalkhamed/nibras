import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GroupList } from '@/components/group-list';
import prisma from '@/lib/prisma';

const cohorts = ['دفعة 2025', 'دفعة 2024', 'دفعة 2023'];

export default async function GroupsPage() {
  const groups = await prisma.group.findMany({
    select: {
      id: true,
      cohortId: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          students: true,
        },
      },
      supervisor: {
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            تصفية الدفعات
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {cohorts.map((cohort) => (
            <Button key={cohort} variant="outline" className="border-border">
              {cohort}
            </Button>
          ))}
          <Button variant="ghost" className="text-muted-foreground">
            إزالة التصفية
          </Button>
        </CardContent>
      </Card>

      <GroupList groups={groups} hrefBase="/dashboard/groups/" />
    </div>
  );
}
