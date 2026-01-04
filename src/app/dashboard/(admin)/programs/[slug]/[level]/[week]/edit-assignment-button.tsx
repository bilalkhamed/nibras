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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage } from '@/components/forms/error-message';
import { Assignment, AssignmentTypes } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import labels from '@/lib/labels.json';
import { updateAssignment } from '@/lib/server/actions';

const assignmentSchema = z.object({
  name: z.string().min(1, 'يرجى إدخال اسم المهمة'),
  description: z.string().optional(),
  type: z.enum(AssignmentTypes, {
    message: 'يرجى اختيار نوع المهمة',
  }),
  url: z.url('يرجى إدخال رابط صحيح').optional().or(z.literal('')),
});

type AssignmentData = z.infer<typeof assignmentSchema>;

export function EditAssignmentButton({
  assignment,
}: {
  assignment: Assignment;
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
    defaultValues: {
      name: assignment.name,
      description: assignment.description || '',
      type: assignment.type,
      url: assignment.url || '',
    },
  });

  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
    }
  };

  const onSubmit: SubmitHandler<AssignmentData> = async (data) => {
    try {
      const result = await updateAssignment(assignment.id, {
        name: data.name,
        description: data.description || null,
        type: data.type,
        url: data.url || null,
      });

      if (result.success) {
        toast.success('تم تحديث المهمة بنجاح!', { duration: 2000 });
        setOpen(false);
      } else {
        toast.error(result.error || 'حدث خطأ أثناء تحديث المهمة', {
          duration: 3000,
        });
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث المهمة. الرجاء المحاولة مرة أخرى.', {
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4 text-blue-500" />
                <span className="sr-only">تعديل المهمة</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>تعديل المهمة</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="sm:max-w-md" dir="rtl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-right">تعديل المهمة</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            {/* Name Field */}
            <div className="grid">
              <Label htmlFor="name" className="text-right">
                اسم المهمة
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

            <div className="grid">
              <Label htmlFor="description" className="text-right">
                الوصف <span className="text-muted-foreground">(اختياري)</span>
              </Label>
              <Input
                id="description"
                placeholder="وصف قصير للمهمة..."
                {...register('description')}
                className="text-right"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid">
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

            <div className="grid">
              <Label htmlFor="url" className="text-right">
                الرابط <span className="text-muted-foreground">(اختياري)</span>
              </Label>
              <Input
                id="url"
                placeholder="رابط المهمة..."
                {...register('url')}
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
                  جاري التحديث...
                </>
              ) : (
                'تحديث'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
