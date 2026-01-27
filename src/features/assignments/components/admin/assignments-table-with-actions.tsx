/**
 * AssignmentsTableWithActions Component
 *
 * Wraps the assignments table with edit and delete action buttons.
 * Used in the admin curriculum management page.
 */

'use client';

import { AssignmentAttachment, AttachmentType } from '@prisma/client';
import { AssignmentsTable } from '@/app/dashboard/components/assignments-table';
import { DeleteAssignmentButton } from './delete-assignment-button';
import { EditAssignmentSheet } from './edit-assignment-sheet';
import type { AssignmentFormData } from './assignment-form';
import type { AssignmentWithAttachmentsDTO } from '../../types';

type AssignmentsTableWithActionsProps = {
  /** Assignments to display */
  assignments: AssignmentWithAttachmentsDTO[];
};

/**
 * Assignments table with edit and delete actions
 */
export function AssignmentsTableWithActions({
  assignments,
}: AssignmentsTableWithActionsProps) {
  return (
    <AssignmentsTable
      assignments={assignments}
      actionButtons={(assignment: AssignmentWithAttachmentsDTO) => {
        const defaultValues: AssignmentFormData = {
          name: assignment.name,
          description: assignment.description,
          type: assignment.type,
          files: assignment.attachments
            .filter(
              (
                att,
              ): att is AssignmentAttachment & {
                type: typeof AttachmentType.FILE;
                key: string;
                name: string;
                tempUrl: string;
                fileKey: string;
              } => att.type === AttachmentType.FILE,
            )
            .map((file) => ({
              id: file.id,
              key: file.fileKey,
              name: file.name,
              type: file.type,
              tempUrl: file.tempUrl,
            })),
          links: assignment.attachments
            .filter(
              (
                att,
              ): att is AssignmentAttachment & {
                type: typeof AttachmentType.LINK;
                url: string;
                tempUrl: string;
              } => att.type === AttachmentType.LINK,
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
