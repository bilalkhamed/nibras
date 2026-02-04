/**
 * EditAssignmentSheet Component
 *
 * Sheet dialog for editing existing assignments.
 * Uses the assignment form and calls the update action.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EditIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AssignmentFormContent, AssignmentFormData } from './assignment-form';
import type { Link } from '../../types';
import { AssignmentTypes } from '@prisma/client';
import { updateAssignmentAction } from '../../actions';
import { toast } from 'sonner';

type EditAssignmentSheetProps = {
  /** Assignment ID to edit */
  assignmentId: string;
  /** Default values from existing assignment */
  defaultValues: {
    name: string;
    description: string | null;
    type: AssignmentTypes;
    links?: Link[];
    allowFileSubmission: boolean;
    allowTextSubmission: boolean;
  };
};

/**
 * Sheet component for editing existing assignments
 */
export function EditAssignmentSheet({
  assignmentId,
  defaultValues,
}: EditAssignmentSheetProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      // Combine existing file keys with new file keys
      const fileKeys = data.files ? data.files.map((file) => file.key) : [];
      if (data.newFileKeys) {
        data.newFileKeys.forEach((key) => {
          fileKeys.push(key);
        });
      }

      const res = await updateAssignmentAction(assignmentId, {
        name: data.name,
        description: data.description,
        type: data.type,
        fileKeys,
        links: data.links?.map((link) => ({
          url: link.url,
          id: link.id,
          type: 'LINK' as const,
        })),
        allowFileSubmission: data.allowFileSubmission,
        allowTextSubmission: data.allowTextSubmission,
      });

      if (res.success) {
        toast.success('تم تحديث المهمة بنجاح.');
        setOpen(false);
      } else {
        throw new Error(res.error);
      }
    } catch {
      toast.error('حدث خطأ أثناء تحديث المهمة.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant={'ghost'} size={'icon'} className="text-blue-600">
          <EditIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-screen p-0 flex flex-col">
        <SheetDescription className="sr-only">
          تعديل {defaultValues.name}
        </SheetDescription>
        <AssignmentFormContent
          title={`تعديل ${defaultValues.name}`}
          submitLabel="حفظ التعديلات"
          onCancel={handleCancel}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
        />
      </SheetContent>
    </Sheet>
  );
}
