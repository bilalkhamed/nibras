import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserRound } from 'lucide-react';
import { Group } from '@/types/types';

type GroupListProps = {
  groups: Group[];
  hrefBase: string;
};

export function GroupList({ groups, hrefBase }: GroupListProps) {
  if (!groups.length) {
    return (
      <p className="text-sm text-muted-foreground text-right">
        لا توجد مجموعات حالياً.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => {
        const href = `${hrefBase}${group.id}`;
        return (
          <Card key={group.id} className="border-border bg-card/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-foreground">
                    {group.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    الدفعة: {group.cohortId}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{group._count.students}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserRound className="h-4 w-4" />
                <span className="text-foreground font-medium">
                  {Object.values(group.supervisor).splice(1).join(' ')}
                </span>
              </div>
              <Button asChild className="w-full" variant="outline">
                <Link href={href}>فتح صفحة المجموعة</Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
