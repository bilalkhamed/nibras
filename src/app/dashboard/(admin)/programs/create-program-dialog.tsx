'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage } from '@/components/forms/error-message';

const programSchema = z.object({
  name: z.string().min(1, 'يرجى إدخال اسم البرنامج'),
  description: z.string().optional(),
});

type ProgramData = z.infer<typeof programSchema>;

export default function CreateProgramDialog({
  buttonVariant = 'primary',
}: {
  buttonVariant?: 'primary' | 'outline';
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProgramData>({
    mode: 'onTouched',
    resolver: zodResolver(programSchema),
  });

  const { name, description } = watch();

  const [open, setOpen] = useState(false);

  const router = useRouter();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  const onSubmit: SubmitHandler<ProgramData> = async (data) => {
    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error();
      }

      router.refresh();
      setOpen(false);
      reset();
      toast.success('تم إنشاء البرنامج بنجاح!', {
        duration: 2000,
      });
    } catch (err) {
      toast.error('حدث خطأ أثناء إنشاء البرنامج. الرجاء المحاولة مرة أخرى.', {
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>
          <Plus className="ml-2 h-4 w-4" />
          برنامج جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-right">إنشاء برنامج جديد</DialogTitle>
            <DialogDescription className="text-right text-muted-foreground">
              أضيفي اسم البرنامج والوصف لإنشاء برنامج تعليمي جديد.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            {/* Name Field */}
            <div className="grid gap-2">
              <Label htmlFor="program-name" className="text-right">
                اسم البرنامج
              </Label>
              <Input
                id="program-name"
                placeholder="مثال: برنامج القراءة"
                {...register('name')}
                className="text-right"
                disabled={isSubmitting}
              />
              <ErrorMessage message={errors.name?.message} />
            </div>

            {/* Description Field */}
            <div className="grid gap-2">
              <Label htmlFor="program-description" className="text-right">
                الوصف <span className="text-muted-foreground">(اختياري)</span>
              </Label>
              <Input
                id="program-description"
                placeholder="وصف قصير للبرنامج..."
                {...register('description')}
                className="text-right"
                disabled={isSubmitting}
              />
            </div>

            {/* Confirmation Message */}
            {name && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-right">
                <p className="text-sm text-foreground/90">
                  <span className="font-semibold">سيتم إضافة:</span>
                  <br />
                  <span className="font-medium text-primary">{name}</span>
                  {description && (
                    <>
                      <br />
                      <span className="text-muted-foreground text-xs">
                        {description}
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                إلغاء
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء البرنامج'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
