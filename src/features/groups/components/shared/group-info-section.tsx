'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Edit, Archive, Trash2, ExternalLink } from 'lucide-react';
import { InfoField } from '@/components/common/info-field';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { Role } from '@prisma/client';
import { ADMIN_ROLE, COHORT_MANAGER_ROLE } from '@/types/types';
import { GroupDetailDTO } from '../../types';
import { EditGroupSheet } from '../management/edit-group-sheet';

interface GroupInfoSectionProps {
  group: GroupDetailDTO;
  user: {
    role: Role;
    managedCohortId: string | null;
  };
}

interface ActionButtonsProps {
  group: GroupDetailDTO;
  managedCohortId: string | null;
}

function ActionButtons({ group, managedCohortId }: ActionButtonsProps) {
  // Prepare default values for edit form
  const defaultValues = {
    name: group.name,
    cohortId: group.cohortId,
    supervisors: group.supervisors.map((s) => s.id),
    supervisorsDetails: group.supervisors,
  };

  return (
    <div className="flex gap-2">
      <EditGroupSheet
        groupId={group.id}
        defaultValues={defaultValues}
        cohortId={managedCohortId || undefined}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>أرشفة المجموعة</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>حذف المجموعة</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function GroupInfoSection({ group, user }: GroupInfoSectionProps) {
  return (
    <TooltipProvider>
      <Card className="border-border bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            معلومات المجموعة
          </CardTitle>
          {(user.role === ADMIN_ROLE || user.role === COHORT_MANAGER_ROLE) && (
            <ActionButtons
              group={group}
              managedCohortId={user.managedCohortId}
            />
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Group Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoField label="اسم المجموعة" value={group.name} />
              <InfoField
                label="الدفعة"
                value={`${group.cohort.name} - ${group.cohort.currentLevel.title}`}
              />
              <InfoField
                label="عدد الطالبات"
                value={`${group.students.length} طالبة`}
              />
            </div>
          </div>

          <Separator />

          {(user.role === ADMIN_ROLE || user.role === COHORT_MANAGER_ROLE) &&
            group.supervisors.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">
                  المشرفات ({group.supervisors.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.supervisors.map((supervisor) => (
                    <div
                      key={supervisor.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {supervisor.firstName} {supervisor.middleName}{' '}
                          {supervisor.lastName}
                        </span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link href={`/dashboard/users/${supervisor.id}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>عرض صفحة المشرفة</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
