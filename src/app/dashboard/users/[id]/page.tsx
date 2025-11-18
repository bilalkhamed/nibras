'use client';

import labels from '@/lib/labels.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound, useParams } from 'next/navigation';

// Dummy resolver – in real app fetch from API
function getUser(id: string) {
  if (!id.startsWith('u')) return null;
  return {
    id,
    name: `طالبة ${id.replace('u', '')}`,
    age: 15,
    cohort: 'دفعة 2',
    country: 'سوريا',
    status: 'نشطة',
    role: 'student' as const,
  };
}

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id;
  if (!id || typeof id !== 'string') return notFound();
  const user = getUser(id);
  if (!user) return notFound();

  return (
    <div className="h-full">
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Card className="border-border shadow-lg bg-card/90 backdrop-blur animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              {labels.dashboard.users.detailsTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Info label={labels.dashboard.users.name} value={user.name} />
              <Info label={labels.dashboard.users.age} value={user.age} />
              <Info label={labels.dashboard.users.cohort} value={user.cohort} />
              <Info
                label={labels.dashboard.users.country}
                value={user.country}
              />
              <Info label={labels.dashboard.users.status} value={user.status} />
              <Info
                label={labels.dashboard.users.role}
                value={
                  user.role === 'student'
                    ? labels.dashboard.users.student
                    : labels.dashboard.users.teacher
                }
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-linear-to-r from-primary to-accent hover:from-accent hover:to-primary text-primary-foreground">
                {labels.dashboard.users.update}
              </Button>
              <Button
                variant="outline"
                className="border-border text-primary hover:bg-secondary/15"
              >
                {labels.dashboard.users.freeze}
              </Button>
              <Button
                variant="danger"
                className="bg-secondary hover:bg-secondary/80"
              >
                {labels.dashboard.users.delete}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm">
        {value}
      </p>
    </div>
  );
}
