'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCallback } from 'react';
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
import {
  SheetClose,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import LinkManager from './link-manager';

export const linkSchema = z.object({
  id: z.string().optional(),
  url: z.url('يرجى إدخال رابط صالح'),
  type: z.literal('LINK'),
});

export type Link = z.infer<typeof linkSchema>;

// Schema for the form (just the basic fields, attachments handled separately)
const assignmentFormSchema = z.object({
  name: z.string().min(1, 'يرجى إدخال اسم المهمة'),
  description: z.string().nullable(),
  type: z.enum(AssignmentTypes, 'يرجى اختيار نوع المهمة'),
  links: linkSchema.array().optional(),
});

export type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

type AssignmentFormContentProps = {
  title: string;
  submitLabel: string;
  defaultValues?: {
    name: string;
    description: string | null;
    type: AssignmentTypes;
    links?: Link[];
  };
  onCancel: () => void;
  onSubmit: (data: AssignmentFormData) => Promise<void>;
};

export function AssignmentFormContent({
  title,
  submitLabel,
  defaultValues,
  onCancel,
  onSubmit,
}: AssignmentFormContentProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormData>({
    mode: 'onTouched',
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          description: defaultValues.description || '',
          type: defaultValues.type,
          links: defaultValues.links || [],
        }
      : undefined,
  });

  const handleFormSubmit: SubmitHandler<AssignmentFormData> = useCallback(
    async (data) => {
      await onSubmit(data);
    },
    [onSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col h-full"
    >
      <SheetHeader className="px-3 pt-3 pb-2 shrink-0">
        <SheetTitle className="text-right">{title}</SheetTitle>
      </SheetHeader>

      <ScrollArea className="flex-1 min-h-0" dir="rtl">
        <div className="grid gap-4 px-3 py-4">
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

          {/* Description Field */}
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

          {/* Type Field */}
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
                  <SelectTrigger tabIndex={0} size="sm" className="w-full mb-2">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent align="center">
                    {Object.keys(AssignmentTypes).map((t) => (
                      <SelectItem key={t} value={t} className="cursor-pointer">
                        {labels.dashboard.curriculum[t as AssignmentTypes]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <ErrorMessage message={errors.type?.message} />
          </div>
        </div>
        <LinkManager control={control} errors={errors.links} />
      </ScrollArea>

      <SheetFooter className="gap-2 px-3 py-3 shrink-0 border-t flex flex-row">
        <SheetClose asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            إلغاء
          </Button>
        </SheetClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </SheetFooter>
    </form>
  );
}
