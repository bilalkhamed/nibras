'use client';

import labels from '@/lib/labels.json';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AssignmentTypes } from '@prisma/client';
import clsx from 'clsx';
import { ExternalLink } from 'lucide-react';

interface Assignment {
  id: string;
  name: string;
  description: string | null;
  type: AssignmentTypes;
  url: string | null;
}

interface AssignmentsTableProps {
  assignments: Assignment[];
}

const ASSIGNMENT_TYPE_COLORS: Record<AssignmentTypes, string> = {
  lecture: 'bg-accent text-accent-foreground text-accent-soft',
  exercise: 'bg-primary text-primary-foreground',
  quiz: 'bg-secondary text-secondary-foreground',
  reading: 'bg-muted text-muted-foreground',
};

const ASSIGNMENT_TYPE_LABELS: Record<AssignmentTypes, string> = {
  lecture: 'محاضرة',
  exercise: 'تمرين',
  quiz: 'اختبار',
  reading: 'قراءة',
};

export function AssignmentsTable({ assignments }: AssignmentsTableProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-md">
          <Table className="">
            <TableHeader className="bg-linear-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right font-semibold">#</TableHead>
                <TableHead className="text-right font-semibold">
                  الاسم
                </TableHead>
                <TableHead className="text-right font-semibold">
                  الوصف
                </TableHead>
                <TableHead className="text-right font-semibold">
                  {labels.dashboard.curriculum.type}
                </TableHead>
                <TableHead className="text-right font-semibold">
                  الرابط
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {assignments.map((a, idx) => (
                <TableRow
                  key={a.id}
                  className="odd:bg-muted/40 even:bg-card dark:odd:bg-muted/25 dark:even:bg-card hover:bg-accent-soft/70 dark:hover:bg-accent-soft/30 transition-colors"
                >
                  <TableCell className="text-muted-foreground font-medium">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {a.name}
                  </TableCell>
                  <TableCell className="text-foreground/80 dark:text-foreground/70 text-sm">
                    {a.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={clsx(
                        'font-medium text-xs',
                        ASSIGNMENT_TYPE_COLORS[a.type]
                      )}
                    >
                      {ASSIGNMENT_TYPE_LABELS[a.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {a.url ? (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <span className="text-xs truncate max-w-xs">
                          {new URL(a.url).hostname}
                        </span>
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {assignments.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              لا توجد مهام لهذا الأسبوع
            </div>
          )}
        </div>
      </div>
    </>
  );
}
