/**
 * CreateAssignmentSheet Component
 *
 * Sheet dialog for creating new assignments.
 * Uses the assignment form and calls the create action.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AssignmentFormContent, AssignmentFormData } from './assignment-form';
import { createAssignmentAction } from '../../actions';
import { toast } from 'sonner';

type CreateAssignmentSheetProps = {
  /** Button variant */
  buttonVariant?: 'primary' | 'outline';
  /** Level slug for the new assignment */
  levelSlug: string;
  /** Week ID for the new assignment */
  weekId: string;
  /** Program slug for the new assignment */
  programSlug: string;
};

/**
 * Sheet component for creating new assignments
 */
export function CreateAssignmentSheet({
  buttonVariant = 'primary',
  levelSlug,
  weekId,
  programSlug,
}: CreateAssignmentSheetProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      const res = await createAssignmentAction({
        weekId,
        levelSlug,
        programSlug,
        assignment: {
          name: data.name,
          description: data.description,
          type: data.type,
          fileKeys: data.newFileKeys,
          links: data.links?.map((link) => ({
            url: link.url,
            id: link.id,
            type: 'LINK' as const,
          })),
          requireFileSubmission: data.requireFileSubmission,
          requireTextSubmission: data.requireTextSubmission,
        },
      });

      if (res.success) {
        toast.success(`تم إنشاء المهمة ${data.name} بنجاح.`);
        setOpen(false);
      } else {
        throw new Error(res.error);
      }
    } catch {
      console.error('Create Assignment Error');
      toast.error('حدث خطأ أثناء إنشاء المهمة.');
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant={buttonVariant}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مهمة
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-screen p-0 flex flex-col">
        <SheetDescription className="sr-only">
          إضافة مهمة جديدة
        </SheetDescription>
        <AssignmentFormContent
          title="إضافة مهمة جديدة"
          submitLabel="إنشاء المهمة"
          onCancel={handleCancel}
          onSubmit={onSubmit}
        />
      </SheetContent>
    </Sheet>
  );
}
