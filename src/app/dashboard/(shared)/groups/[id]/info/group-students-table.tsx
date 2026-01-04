import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/shared/utils';
import StudentActions from './student-actions';
import { ADMIN_ROLE } from '@/types/types';

export interface GroupStudent {
  student: {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
  };
  joinedAt: Date;
}

interface GroupStudentsTableProps {
  groupStudents: GroupStudent[];
  groupId: string;
  userRole: string;
}

export default function GroupStudentsTable({
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
            {userRole === ADMIN_ROLE && (
              <TableHead className=" text-center">الإجراءات</TableHead>
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
                {student.firstName} {student.middleName} {student.lastName}
              </TableCell>

              <TableCell className="text-right text-sm">
                {formatDate(joinedAt)}
              </TableCell>
              {userRole === ADMIN_ROLE && (
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
