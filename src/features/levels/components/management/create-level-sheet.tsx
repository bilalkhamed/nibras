'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LevelForm } from './level-form';
import type { CreateLevelData } from '../../types';
import { toast } from 'sonner';
import { createLevelAction } from '../../actions';

type CreateLevelSheetProps = {
  children: React.ReactNode;
  onSuccess?: (levelId: string) => void;
};

export function CreateLevelSheet({
  children,
  onSuccess,
}: CreateLevelSheetProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onSubmit = async (data: CreateLevelData) => {
    try {
      const result = await createLevelAction(data);

      if (!result.success) {
        throw new Error(`فشل إنشاء المستوى: ${result.error?.statusCode}`);
      }

      toast.success('تم إنشاء المستوى بنجاح!');

      setTimeout(() => {
        setOpen(false);
        if (onSuccess && result.data) {
          onSuccess(result.data.levelId);
        }
      }, 1500);
    } catch (err) {
      toast.error('حدث خطأ أثناء إنشاء المستوى.');
      throw err;
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="w-screen p-0 flex flex-col">
        <SheetTitle className="sr-only">إنشاء مستوى جديد</SheetTitle>
        <SheetDescription className="sr-only">
          نموذج إنشاء مستوى جديد
        </SheetDescription>
        <LevelForm
          title="إنشاء مستوى جديد"
          submitLabel="إنشاء المستوى"
          onSubmit={onSubmit}
          onCancel={handleCancel}
        />
      </SheetContent>
    </Sheet>
  );
}
