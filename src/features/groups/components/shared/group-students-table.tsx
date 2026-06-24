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
import labels from '@/lib/labels.json';

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
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border">
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">تاريخ الانضمام</TableHead>
            {(userRole === ADMIN_ROLE || userRole === COHORT_MANAGER_ROLE) && (
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
                    {student.firstName} {student.middleName} {student.lastName}
                  </span>
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
  );
}
