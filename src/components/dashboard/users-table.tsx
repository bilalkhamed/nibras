'use client';

import React, { useMemo, useState } from 'react';
import labels from '@/lib/labels.json';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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

interface User {
  id: string;
  name: string;
  age: number;
  cohort: string;
  country: string;
  status: string;
  role: 'student' | 'teacher';
}

export const dummyUsers: User[] = Array.from({ length: 120 }).map((_, i) => ({
  id: `u${i + 1}`,
  name: `طالبة ${i + 1}`,
  age: 12 + (i % 6),
  cohort: `دفعة ${(i % 5) + 1}`,
  country: 'سوريا',
  status: i % 3 === 0 ? 'نشطة' : 'معلقة',
  role: i % 4 === 0 ? 'teacher' : 'student',
}));

dummyUsers.push(
  {
    id: 'u121',
    name: 'أحمد علي',
    age: 15,
    cohort: 'دفعة 3',
    country: 'مصر',
    status: 'نشطة',
    role: 'student',
  },
  {
    id: 'u122',
    name: 'سارة محمد',
    age: 14,
    cohort: 'دفعة 2',
    country: 'الأردن',
    status: 'معلقة',
    role: 'teacher',
  }
);

interface UsersTableProps {
  pageSize?: number;
}

export function UsersTable({ pageSize = 10 }: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [cohortFilter, setCohortFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    return dummyUsers.filter((u) => {
      const matchesName = u.name.includes(search.trim());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesCohort = cohortFilter === 'all' || u.cohort === cohortFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesName && matchesRole && matchesCohort && matchesStatus;
    });
  }, [search, roleFilter, cohortFilter, statusFilter]);

  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const pageUsers = filtered.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  const uniqueCohorts = Array.from(new Set(dummyUsers.map((u) => u.cohort)));

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-foreground">
        {labels.dashboard.users.tableTitle}
      </h3>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-muted-foreground">
            {labels.dashboard.users.searchPlaceholder}
          </label>
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-56 border-border"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs text-muted-foreground">
            {labels.dashboard.users.filterRole}
          </label>
          <Select
            dir="rtl"
            value={roleFilter}
            onValueChange={(val) => {
              setRoleFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-40 border-border bg-card text-foreground">
              <SelectValue placeholder={labels.dashboard.users.all} />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border border-border">
              <SelectItem value="all">{labels.dashboard.users.all}</SelectItem>
              <SelectItem value="student">
                {labels.dashboard.users.student}
              </SelectItem>
              <SelectItem value="teacher">
                {labels.dashboard.users.teacher}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs text-muted-foreground">
            {labels.dashboard.users.filterCohort}
          </label>
          <Select
            dir="rtl"
            value={cohortFilter}
            onValueChange={(val) => {
              setCohortFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-40 border-border bg-card text-foreground">
              <SelectValue placeholder={labels.dashboard.users.all} />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border border-border">
              <SelectItem value="all">{labels.dashboard.users.all}</SelectItem>
              {uniqueCohorts.map((cohort) => (
                <SelectItem key={cohort} value={cohort}>
                  {cohort}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs text-muted-foreground">
            {labels.dashboard.users.filterStatus}
          </label>
          <Select
            dir="rtl"
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-40 border-border bg-card text-foreground">
              <SelectValue placeholder={labels.dashboard.users.all} />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border border-border">
              <SelectItem value="all">{labels.dashboard.users.all}</SelectItem>
              <SelectItem value="نشطة">
                {labels.dashboard.users.active}
              </SelectItem>
              <SelectItem value="معلقة">
                {labels.dashboard.users.suspended}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs text-muted-foreground">
            {labels.dashboard.users.itemsPerPage}
          </label>
          <Select
            dir="rtl"
            value={String(itemsPerPage)}
            onValueChange={(val) => {
              setItemsPerPage(Number(val));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-28 border-border bg-card text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card text-foreground border border-border">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col justify-end">
          <Button
            variant="subtle"
            size="md"
            onClick={() => {
              setRoleFilter('all');
              setCohortFilter('all');
              setStatusFilter('all');
              setSearch('');
              setPage(0);
            }}
          >
            {labels.dashboard.users.resetFilters}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-md">
        <Table className="">
          <TableHeader className="bg-linear-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-right font-semibold">#</TableHead>
              <TableHead className="text-right font-semibold">
                {labels.dashboard.users.name}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {labels.dashboard.users.age}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {labels.dashboard.users.cohort}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {labels.dashboard.users.country}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {labels.dashboard.users.status}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {labels.dashboard.users.role}
              </TableHead>
              <TableHead className="text-right font-semibold">
                {labels.dashboard.users.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {pageUsers.map((u, idx) => (
              <TableRow
                key={u.id}
                className="odd:bg-muted/40 even:bg-card dark:odd:bg-muted/25 dark:even:bg-card hover:bg-accent-soft/70 dark:hover:bg-accent-soft/30 transition-colors"
              >
                <TableCell className="text-muted-foreground font-medium">
                  {page * itemsPerPage + idx + 1}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/users/${u.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {u.name}
                  </Link>
                </TableCell>
                <TableCell className="text-foreground/90 dark:text-foreground">
                  {u.age}
                </TableCell>
                <TableCell className="text-foreground/90 dark:text-foreground">
                  {u.cohort}
                </TableCell>
                <TableCell className="text-foreground/90 dark:text-foreground">
                  {u.country}
                </TableCell>
                <TableCell className="text-foreground">
                  <span
                    className={
                      u.status === 'نشطة'
                        ? 'text-success font-medium'
                        : 'text-warning font-medium'
                    }
                  >
                    {u.status}
                  </span>
                </TableCell>
                <TableCell className="text-foreground">
                  {u.role === 'student'
                    ? labels.dashboard.users.student
                    : labels.dashboard.users.teacher}
                </TableCell>
                <TableCell>
                  <Link href={`/dashboard/users/${u.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-primary hover:bg-primary/15 dark:hover:bg-primary/25"
                    >
                      {labels.dashboard.users.view}
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {pageUsers.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            {labels.dashboard.users.noResults}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {labels.dashboard.users.page} {page + 1} {labels.dashboard.users.of}{' '}
          {pageCount}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="border-border hover:bg-muted/50 dark:hover:bg-muted/20"
          >
            {labels.dashboard.users.previous}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="border-border hover:bg-muted/50 dark:hover:bg-muted/20"
          >
            {labels.dashboard.users.next}
          </Button>
        </div>
      </div>
    </div>
  );
}
