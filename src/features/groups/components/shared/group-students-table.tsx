'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, formatDate } from '@/lib/shared/utils';
import { StudentActions } from '../admin/student-actions';
import { ADMIN_ROLE, COHORT_MANAGER_ROLE } from '@/types/types';
import { GroupStudentInfoDTO } from '../../types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { InviteRegenModal } from '@/features/users/components/invite-regen-modal';
import labels from '@/lib/labels.json';
import { ForwardIcon, LinkIcon, ShareIcon } from 'lucide-react';

interface GroupStudentsTableProps {
  groupStudents: GroupStudentInfoDTO[];
  groupId: string;
  userRole: string;
}

export function GroupStudentsTable({
  groupStudents,
  groupId,
  userRole,
}: GroupStudentsTableProps) {
  const [inviteModalState, setInviteModalState] = useState<{
    open: boolean;
    user: { id: string; firstName: string };
  }>({ open: false, user: { id: '', firstName: '' } });

  return (
    <>
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">تاريخ الانضمام</TableHead>
              {(userRole === ADMIN_ROLE ||
                userRole === COHORT_MANAGER_ROLE) && (
                <TableHead className="text-center">الإجراءات</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupStudents.map(({ student, joinedAt }) => (
              <TableRow
                key={student.id}
                className="border-b border-border hover:bg-muted/50"
              >
                <TableCell className="text-right font-medium">
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            'inline-block h-2 w-2 rounded-full transition-all duration-300 opacity-70 hover:opacity-100',
                            student.status === 'active'
                              ? 'bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_8px_#10b981] hover:scale-110'
                              : 'bg-secondary hover:bg-secondary/80 hover:shadow-[0_0_8px_rgba(156,163,175,0.8)] hover:scale-110',
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {labels.dashboard.users[student.status]}
                      </TooltipContent>
                    </Tooltip>
                    <span>
                      {student.firstName} {student.middleName}{' '}
                      {student.lastName}
                    </span>
                    {student.status === 'invited' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-secondary h-6 px-2 text-[11px] font-normal"
                            onClick={() =>
                              setInviteModalState({
                                open: true,
                                user: {
                                  id: student.id,
                                  firstName: student.firstName,
                                },
                              })
                            }
                          >
                            <LinkIcon className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>إرسال دعوة</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right text-sm">
                  {formatDate(joinedAt)}
                </TableCell>
                {(userRole === ADMIN_ROLE ||
                  userRole === COHORT_MANAGER_ROLE) && (
                  <TableCell className="text-right">
                    <StudentActions groupId={groupId} studentId={student.id} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
