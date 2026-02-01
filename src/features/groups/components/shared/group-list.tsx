import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserRound, XCircleIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { GroupListItemDTO } from '../../types';

type GroupListProps = {
  groups: GroupListItemDTO[];
  hrefBase: string;
};

export function GroupList({ groups, hrefBase }: GroupListProps) {
  if (!groups.length) {
    return (
      <div className="flex items-center justify-center">
        <Alert variant="warning" className="max-w-md">
          <XCircleIcon className="h-4 w-4 shrink-0 mr-2" />
          <AlertTitle>لا توجد مجموعات متاحة.</AlertTitle>
          <AlertDescription>
            يمكنك إنشاء مجمموعة جديدة من خلال الزر في الأعلى
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => {
        const href = `${hrefBase}${group.id}`;
        return (
          <Card
            key={group.id}
            className="group relative border-primary/15 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <CardTitle className="text-lg font-bold text-foreground">
                    {group.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {group.cohort.name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-primary-soft border border-primary/15 px-3 py-1.5 text-xs font-semibold text-primary">
                  <Users className="h-3.5 w-3.5" />
                  <span>{group._count.students}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-soft border border-secondary/15">
                  <UserRound className="h-4 w-4 text-secondary-foreground" />
                </div>
                <span className="text-foreground font-medium">
                  {group.supervisors
                    .map(
                      (supervisor) =>
                        `${supervisor.firstName} ${supervisor.lastName}`,
                    )
                    .join('، ')}
                </span>
              </div>
              <Separator className="my-3" />
              <div className="flex gap-2">
                <Button
                  asChild
                  className="flex-1 rounded-full"
                  variant="outline"
                  size="sm"
                >
                  <Link href={`${href}/progress`}>
                    <span className="font-medium">متابعة التقدم</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  className="flex-1 rounded-full"
                  variant="ghost"
                  size="sm"
                >
                  <Link href={`${href}/info`}>
                    <span className="font-medium">معلومات</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
