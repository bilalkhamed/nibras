import prisma from '@/lib/server/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';

interface ProgramDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;

  const program = await prisma.program.findUnique({
    where: { slug },
    include: {
      assignments: {
        select: {
          id: true,
          name: true,
          type: true,
          level: {
            select: {
              id: true,
              number: true,
              title: true,
            },
          },
          week: {
            select: {
              id: true,
              number: true,
              title: true,
            },
          },
        },
        orderBy: [{ level: { number: 'asc' } }, { week: { number: 'asc' } }],
      },
    },
  });

  if (!program) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back Button + Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {program.name}
            </h1>
            {program.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {program.description}
              </p>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href="#" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            مهمة جديدة
          </Link>
        </Button>
      </div>

      {/* Curriculum Table */}
      <Card>
        <CardHeader>
          <CardTitle>المقرر الدراسي</CardTitle>
          <CardDescription>
            عدد المهام: {program.assignments.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {program.assignments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                لا توجد مهام في هذا البرنامج حتى الآن
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المستوى</TableHead>
                    <TableHead>الأسبوع</TableHead>
                    <TableHead>اسم المهمة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead className="w-20 text-center">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {program.assignments.map(
                    (assignment: (typeof program.assignments)[0]) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-900">
                            المستوى {assignment.level.number}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-sm">
                            الأسبوع {assignment.week.number}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {assignment.name}
                        </TableCell>
                        <TableCell>
                          <span className="inline-block rounded-md bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                            {assignment.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm">
                            تعديل
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
