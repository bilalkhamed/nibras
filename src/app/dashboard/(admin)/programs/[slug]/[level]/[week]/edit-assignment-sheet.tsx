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
import {
  AssignmentFormContent,
  AssignmentFormData,
  Link,
} from './assignment-form';
import { AssignmentTypes } from '@prisma/client';
import { updateAssignment } from '@/lib/server/actions';
import { toast } from 'sonner';

type CreateAssignmentSheetProps = {
  assignmentId: string;
  defaultValues: {
    name: string;
    description: string | null;
    type: AssignmentTypes;
    links?: Link[];
  };
};

export function EditAssignmentSheet({
  assignmentId,
  defaultValues,
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
      console.log('submitting', data);
      const fileKeys = data.files ? data.files.map((file) => file.key) : [];
      if (data.newFileKeys) {
        data.newFileKeys.forEach((key) => {
          fileKeys.push(key);
        });
      }

      const res = await updateAssignment(assignmentId, {
        ...data,
        fileKeys,
      });
      if (res.success) {
        toast.success('تم تحديث المهمة بنجاح.');
        setOpen(false);
      } else {
        throw new Error();
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
