'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
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
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage } from '@/components/forms/error-message';
import { AssignmentTypes } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import labels from '@/lib/labels.json';

const assignmentSchema = z.object({
  name: z.string().min(1, 'يرجى إدخال اسم المهمة'),
  description: z.string().optional(),
  type: z.enum(AssignmentTypes, 'يرجى اختيار نوع المهمة'),
  url: z.url('يرجى إدخال رابط صحيح').optional().nullable(),
});

type AssignmentData = z.infer<typeof assignmentSchema>;

export function AddAssignmentDialog({
  buttonVariant = 'primary',
  levelSlug,
  weekId,
  programSlug,
}: {
  buttonVariant?: 'primary' | 'outline';
  levelSlug: string;
  weekId: string;
  programSlug: string;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentData>({
    mode: 'onTouched',
    resolver: zodResolver(assignmentSchema),
  });

  const [open, setOpen] = useState(false);

  const router = useRouter();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  const onSubmit: SubmitHandler<AssignmentData> = async (data) => {
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          levelSlug,
          weekId,
          programSlug,
          assignment: data,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      router.refresh();
      setOpen(false);
      reset();
      toast.success('تم إضافة المهمة بنجاح!', {
        duration: 2000,
      });
    } catch (err) {
      toast.error('حدث خطأ أثناء إضافة المهمة. الرجاء المحاولة مرة أخرى.', {
        duration: 2000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مهمة
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-right">إضافة مهمة جديدة</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            {/* Name Field */}
            <div className="grid">
              <Label htmlFor="name" className="text-right">
                اسم البرنامج
              </Label>
              <Input
                id="name"
                placeholder="اسم المهمة..."
                {...register('name')}
                className="text-right mb-2"
                disabled={isSubmitting}
              />
              <ErrorMessage message={errors.name?.message} />
            </div>

            <div className="grid ">
              <Label htmlFor="description" className="text-right">
                الوصف <span className="text-muted-foreground">(اختياري)</span>
              </Label>
              <Input
                id="description"
                placeholder="وصف قصير للمهمة..."
                {...register('description')}
                className="text-right "
                disabled={isSubmitting}
              />
            </div>

            <div className="grid ">
              <Label htmlFor="type" className="text-right">
                النوع
              </Label>
              <Controller
                control={control}
                name="type"
                render={({ field: { onBlur, onChange, value } }) => (
                  <Select
                    value={value}
                    onValueChange={(v) => {
                      onChange(v);
                      onBlur();
                    }}
                    dir="rtl"
                  >
                    <SelectTrigger size="sm" className="w-100 mb-2">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent align="center">
                      {Object.keys(AssignmentTypes).map((t) => {
                        return (
                          <SelectItem
                            key={t}
                            value={t}
                            className="cursor-pointer"
                          >
                            {labels.dashboard.curriculum[t as AssignmentTypes]}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              <ErrorMessage message={errors.type?.message} />
            </div>

            <div className="grid ">
              <Label htmlFor="url" className="text-right">
                الرابط <span className="text-muted-foreground">(اختياري)</span>
              </Label>
              <Input
                id="url"
                placeholder="رابط المهمة..."
                {...register('url', {
                  setValueAs: (value) => value || undefined,
                })}
                className="text-right mb-2"
                disabled={isSubmitting}
              />
              <ErrorMessage message={errors.url?.message} />
            </div>
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
