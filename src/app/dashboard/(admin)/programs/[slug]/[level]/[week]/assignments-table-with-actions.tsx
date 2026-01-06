'use client';

import { Assignment, AssignmentAttachment } from '@prisma/client';
import { AssignmentsTable } from '@/app/dashboard/components/assignments-table';
import { DeleteAssignmentButton } from './delete-assignment-button';
import { EditAssignmentButton } from './edit-assignment-button';

export function AssignmentsTableWithActions({
  assignments,
}: {
  assignments: (Assignment & { attachments: AssignmentAttachment[] })[];
}) {
  return (
    <AssignmentsTable
      assignments={assignments}
      actionButtons={(assignment: Assignment) => (
        <div className="flex items-center justify-center gap-1">
          <EditAssignmentButton assignment={assignment} />
          <DeleteAssignmentButton assignmentId={assignment.id} />
        </div>
      )}
    />
  );
}
