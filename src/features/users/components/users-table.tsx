'use client';

import { useMemo, useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ACTIVE_STATUS,
  CountryCode,
  DELETED_STATUS,
  INVITED_STATUS,
  SUSPENDED_STATUS,
  UserStatus,
} from '@/types/types';
import clsx from 'clsx';
import { MoreVertical } from 'lucide-react';
import { InviteRegenModal } from './invite-regen-modal';
import { ResetUserDialog } from './reset-user-dialog';
import { UserWithCohortDTO } from '../types';

interface UsersTableProps {
  users: UserWithCohortDTO[];
  pageSize?: number;
}

export function UsersTable({ users, pageSize = 10 }: UsersTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [cohortFilter, setCohortFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [page, setPage] = useState(0);

  const [inviteModalState, setInviteModalState] = useState<{
    open: boolean;
    user: { id: string; firstName: string };
  }>({ open: false, user: { id: '', firstName: '' } });

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const fullName =
        `${u.firstName} ${u.middleName} ${u.lastName}`.toLowerCase();
      const matchesName =
        fullName.includes(search.trim().toLowerCase()) ||
        u.email?.toLowerCase().includes(search.trim().toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesCohort = cohortFilter === 'all';
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesName && matchesRole && matchesCohort && matchesStatus;
    });
  }, [users, search, roleFilter, cohortFilter, statusFilter]);

  const pageCount = Math.ceil(filtered.length / itemsPerPage);
  const pageUsers = filtered.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage,
  );

  return (
    <>
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
                <SelectItem value="all">
                  {labels.dashboard.users.all}
                </SelectItem>
                <SelectItem value="student">
                  {labels.dashboard.users.student}
                </SelectItem>
                <SelectItem value="supervisor">
                  {labels.dashboard.users.supervisor}
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
                <SelectItem value="all">
                  {labels.dashboard.users.all}
                </SelectItem>
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
                <SelectItem value="all">
                  {labels.dashboard.users.all}
                </SelectItem>
                {Object.values(UserStatus).map((status) => {
                  return (
                    <SelectItem key={status} value={status}>
                      {labels.dashboard.users[status]}
                    </SelectItem>
                  );
                })}
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
                <TableHead className="text-right font-semibold w-12">
                  {labels.dashboard.users.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {pageUsers.map((u) => (
                <RowWithActions
                  key={u.id}
                  u={u}
                  onInviteClick={() =>
                    setInviteModalState({
                      open: true,
                      user: { id: u.id, firstName: u.firstName },
                    })
                  }
                />
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
      <InviteRegenModal
        open={inviteModalState.open}
        onOpenChange={(open) => {
          if (!open) {
            return setInviteModalState({
              open,
              user: { id: '', firstName: '' },
            });
          }
          return setInviteModalState((prev) => ({ ...prev, open }));
        }}
        user={inviteModalState.user}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// RowWithActions
// ---------------------------------------------------------------------------
// Extracted into its own component so each row owns its dropdown + dialog
// state independently — only one dialog ever mounts per row.

type RowWithActionsProps = {
  u: UserWithCohortDTO;
  onInviteClick: () => void;
};

function RowWithActions({ u, onInviteClick }: RowWithActionsProps) {
  const [resetOpen, setResetOpen] = useState(false);
  const age = (birthYear: number) => new Date().getFullYear() - birthYear;

  return (
    <>
      <TableRow className="odd:bg-muted/40 even:bg-card dark:odd:bg-muted/25 dark:even:bg-card hover:bg-accent-soft/70 dark:hover:bg-accent-soft/30 transition-colors">
        <TableCell>
          <Link
            href={`/dashboard/users/${u.id}`}
            className="text-primary hover:underline font-medium"
          >
            {u.firstName} {u.middleName} {u.lastName}
          </Link>
        </TableCell>
        <TableCell className="text-foreground/90 dark:text-foreground">
          {age(u.birthYear)}
        </TableCell>
        <TableCell className="text-foreground/90 dark:text-foreground">
          {u.cohort?.name || '-'}
        </TableCell>
        <TableCell className="text-foreground/90 dark:text-foreground">
          {labels.countries[u.country as CountryCode] || labels.common.null}
        </TableCell>
        <TableCell className="text-foreground">
          <span
            className={clsx('font-medium text-center', {
              'text-success': u.status === ACTIVE_STATUS,
              'text-warning': u.status === SUSPENDED_STATUS,
              'text-secondary': u.status === INVITED_STATUS,
              'text-destructive': u.status === DELETED_STATUS,
            })}
          >
            {u.status === INVITED_STATUS ? (
              <Button
                size="sm"
                variant="outline"
                className="text-secondary translate-x-2.5"
                onClick={onInviteClick}
              >
                {labels.dashboard.users.invited}
              </Button>
            ) : (
              labels.dashboard.users[u.status]
            )}
          </span>
        </TableCell>
        <TableCell className="text-foreground">
          {labels.dashboard.users[u.role]}
        </TableCell>
        <TableCell className="text-left">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" className="bg-card">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/users/${u.id}`}>
                  {labels.dashboard.users.view}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setResetOpen(true);
                }}
              >
                إعادة تعيين الحساب
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Mounted outside the row so the AlertDialog portal isn't clipped */}
      <ResetUserDialog
        userId={u.id}
        userName={`${u.firstName} ${u.lastName}`}
        open={resetOpen}
        onOpenChange={setResetOpen}
      />
    </>
  );
}
