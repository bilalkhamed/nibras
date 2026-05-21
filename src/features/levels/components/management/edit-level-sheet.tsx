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
import type { LevelListDTO, CreateLevelData } from '../../types';
import { toast } from 'sonner';
import { updateLevelAction } from '../../actions';

type EditLevelSheetProps = {
  children: React.ReactNode;
  level: LevelListDTO;
  onSuccess?: (levelId: string) => void;
};

export function EditLevelSheet({
  children,
  level,
  onSuccess,
}: EditLevelSheetProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const onSubmit = async (data: CreateLevelData) => {
    try {
      const result = await updateLevelAction(level.id, data);

      if (!result.success) {
        throw new Error(`فشل تحديث المستوى: ${result.error?.statusCode}`);
      }

      toast.success('تم تحديث المستوى بنجاح!');

      setTimeout(() => {
        setOpen(false);
        if (onSuccess && result.data) {
          onSuccess(result.data.levelId);
        }
      }, 1500);
    } catch (err) {
      toast.error('حدث خطأ أثناء تحديث المستوى.');
      throw err;
    }
  };

  const defaultValues: CreateLevelData = {
    number: level.number,
    title: level.title,
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="w-screen p-0 flex flex-col">
        <SheetTitle className="sr-only">تعديل المستوى</SheetTitle>
        <SheetDescription className="sr-only">
          نموذج تعديل المستوى
        </SheetDescription>
        <LevelForm
          title={`تعديل: ${level.title}`}
          submitLabel="حفظ التعديلات"
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          onCancel={handleCancel}
        />
      </SheetContent>
    </Sheet>
  );
}
