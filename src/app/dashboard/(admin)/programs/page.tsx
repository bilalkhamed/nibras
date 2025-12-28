import prisma from '@/lib/server/prisma';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import CreateProgramDialog from './create-program-dialog';
import { CustomToaster } from '@/components/common/custom-toaster';

export default async function ProgramsPage() {
  const programs = await prisma.program.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
    },
  });

  return (
    <div className="space-y-6">
      <CustomToaster />
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">البرامج</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            إدارة البرامج التعليمية والمقررات الدراسية
          </p>
        </div>
        <CreateProgramDialog />
      </div>

      {/* Programs Grid */}
      {programs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                لا توجد برامج حتى الآن
              </p>
              <div className="mt-4">
                <CreateProgramDialog buttonVariant="outline" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((program: (typeof programs)[0]) => (
            <Card
              key={program.id}
              className="flex flex-col transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <CardTitle className="text-lg">{program.name}</CardTitle>
                {program.description && (
                  <CardDescription className="line-clamp-2">
                    {program.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                {/* Action Buttons */}
                <div className="mt-auto flex gap-2 pt-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Link
                      href={`/dashboard/programs/${program.slug}`}
                      className="flex items-center justify-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      عرض المقرر
                    </Link>
                  </Button>
                  {/* <Button variant="ghost" size="sm" className="flex-1">
                    تعديل
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
