import React from 'react';
import labels from '@/lib/labels.json';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface CurriculumItem {
  id: string;
  source: string;
  title: string;
}

interface CurriculumTableProps {
  items: CurriculumItem[];
}

export function CurriculumTable({ items }: CurriculumTableProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card shadow-md">
      <Table>
        <TableHeader className="bg-linear-to-r from-primary/10 to-secondary/15">
          <TableRow>
            <TableHead className="text-right w-24">
              {labels.dashboard.curriculum.type}
            </TableHead>
            <TableHead className="text-right">
              {labels.dashboard.curriculum.titleCol}
            </TableHead>
            <TableHead className="text-right w-32">
              {labels.dashboard.curriculum.actions}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className="hover:bg-secondary/15 transition-colors"
            >
              <TableCell className="text-xs font-medium">
                {item.source}
              </TableCell>
              <TableCell className="text-sm">{item.title}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" variant="outline">
                  تحرير
                </Button>
                <Button size="sm" variant="danger">
                  حذف
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {items.length === 0 && (
        <div className="p-6 text-center text-sm text-muted-foreground">
          لا يوجد عناصر لهذا الأسبوع
        </div>
      )}
    </div>
  );
}
