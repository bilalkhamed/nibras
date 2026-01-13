'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AssignmentFormContent, AssignmentFormData } from './assignment-form';
import { createAssignment } from '@/lib/server/actions';
import { toast } from 'sonner';

type CreateAssignmentSheetProps = {
  buttonVariant?: 'primary' | 'outline';
  levelSlug: string;
  weekId: string;
  programSlug: string;
};

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
      const res = await createAssignment({
        weekId,
        levelSlug,
        programSlug,
        assignment: data,
      });
      if (res.success) {
        toast.success(`تم إنشاء المهمة ${data.name} بنجاح.`);
        setOpen(false);
      } else {
        throw new Error();
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
