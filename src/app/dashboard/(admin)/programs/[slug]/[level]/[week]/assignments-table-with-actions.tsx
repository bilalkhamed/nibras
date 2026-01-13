'use client';

import {
  Assignment,
  AssignmentAttachment,
  AssignmentTypes,
  AttachmentType,
} from '@prisma/client';
import { AssignmentsTable } from '@/app/dashboard/components/assignments-table';
import { DeleteAssignmentButton } from './delete-assignment-button';
import { EditAssignmentSheet } from './edit-assignment-sheet';
import { AssignmentWithAttachments } from '@/types/types';
import { AssignmentFormData } from './assignment-form';

export function AssignmentsTableWithActions({
  assignments,
}: {
  assignments: AssignmentWithAttachments[];
}) {
  return (
    <AssignmentsTable
      assignments={assignments}
      actionButtons={(assignment: AssignmentWithAttachments) => {
        const defaultValues: AssignmentFormData = {
          name: assignment.name,
          description: assignment.description,
          type: assignment.type,
          links: assignment.attachments
            .filter(
              (
                att
              ): att is AssignmentAttachment & {
                type: typeof AttachmentType.LINK;
                url: string;
                tempUrl: string;
              } => att.type === AttachmentType.LINK
            )
            .map((link) => ({
              id: link.id,
              url: link.url,
              type: link.type,
            })),
        };

        return (
          <div className="flex items-center justify-center gap-1">
            <EditAssignmentSheet
              assignmentId={assignment.id}
              defaultValues={defaultValues}
            />
            <DeleteAssignmentButton assignmentId={assignment.id} />
          </div>
        );
      }}
    />
  );
}
