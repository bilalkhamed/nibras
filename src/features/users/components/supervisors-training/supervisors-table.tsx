'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { updateSupervisorStatusAction } from '../../actions/update-supervisor-status';
import { UserBasicDTO } from '../../types';
import { Trash2, Search } from 'lucide-react';

interface SupervisorsTableProps {
  supervisors: UserBasicDTO[];
  pageSize?: number;
}

export function SupervisorsTable({
  supervisors,
  pageSize = 10,
}: SupervisorsTableProps) {
  const [search, setSearch] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return supervisors.filter((supervisor) => {
      const fullName =
        `${supervisor.firstName} ${supervisor.middleName || ''} ${supervisor.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(search.trim().toLowerCase()) ||
        supervisor.email?.toLowerCase().includes(search.trim().toLowerCase());
      return matchesSearch;
    });
  }, [supervisors, search]);

  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const pageSupervisors = filtered.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage,
  );

  const handleRemoveFromTraining = async (
    supervisorId: string,
    firstName: string,
  ) => {
    try {
      const result = await updateSupervisorStatusAction({
        supervisorId,
        newStatus: 'trained',
      });

      if (result.success) {
        toast.success(`تمت إزالة ${firstName} من التدريب بنجاح.`);
      } else {
        toast.error(`حدث خطأ أثناء إزالة ${firstName} من التدريب.`, {
          description: result.error.message || 'يرجى المحاولة مرة أخرى.',
        });
      }
    } catch (error) {
      toast.error(`حدث خطأ أثناء إزالة ${firstName} من التدريب.`, {
        description:
          error instanceof Error ? error.message : 'يرجى المحاولة مرة أخرى.',
      });
    }
  };

  const calculateAge = (birthYear: number) =>
    new Date().getFullYear() - birthYear;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col space-y-1 flex-1 min-w-64">
          <label className="text-xs font-medium text-muted-foreground">
            البحث عن مشرفة
          </label>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="اسم أو بريد إلكتروني..."
              className="pl-3 pr-10 border-border"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            عدد الصفوف
          </label>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(val) => {
              setItemsPerPage(Number(val));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-24 border-border bg-card text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border border-border">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col justify-end">
          <Button
            variant="subtle"
            size="sm"
            onClick={() => {
              setSearch('');
              setPage(0);
              setItemsPerPage(pageSize);
            }}
          >
            إعادة تعيين
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-md">
        <Table>
          <TableHeader className="bg-linear-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-right font-semibold">#</TableHead>
              <TableHead className="text-right font-semibold">الاسم</TableHead>
              <TableHead className="text-right font-semibold">
                البريد الإلكتروني
              </TableHead>
              <TableHead className="text-right font-semibold">العمر</TableHead>
              <TableHead className="text-right font-semibold">الدور</TableHead>
              <TableHead className="text-right font-semibold">
                الإجراءات
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageSupervisors.map((supervisor, idx) => (
              <TableRow
                key={supervisor.id}
                className="odd:bg-muted/40 even:bg-card dark:odd:bg-muted/25 dark:even:bg-card hover:bg-accent-soft/70 dark:hover:bg-accent-soft/30 transition-colors"
              >
                <TableCell className="text-muted-foreground font-medium">
                  {page * itemsPerPage + idx + 1}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  <Link
                    href={`/dashboard/users/${supervisor.id}`}
                    className="text-primary hover:underline"
                  >
                    {supervisor.firstName} {supervisor.middleName || ''}{' '}
                    {supervisor.lastName}
                  </Link>
                </TableCell>
                <TableCell className="text-foreground/90 dark:text-foreground text-sm">
                  {supervisor.email || '-'}
                </TableCell>
                <TableCell className="text-foreground/90 dark:text-foreground">
                  {calculateAge(supervisor.birthYear)} سنة
                </TableCell>
                <TableCell className="text-foreground">
                  <span className="text-sm font-medium text-primary">
                    مشرفة
                  </span>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            handleRemoveFromTraining(
                              supervisor.id,
                              supervisor.firstName,
                            )
                          }
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          إزالة
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>ازالة من برنامج التدريب</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pageSupervisors.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            لم يتم العثور على مشرفات
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          الصفحة {page + 1} من {pageCount || 1} • إجمالي: {filtered.length}{' '}
          مشرفات
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="border-border hover:bg-muted/50 dark:hover:bg-muted/20"
          >
            السابق
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="border-border hover:bg-muted/50 dark:hover:bg-muted/20"
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}
