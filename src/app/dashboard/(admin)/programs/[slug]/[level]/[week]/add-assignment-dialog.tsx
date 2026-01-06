'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Loader2, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage } from '@/components/forms/error-message';
import { AssignmentTypes, AttachmentType } from '@prisma/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import labels from '@/lib/labels.json';
import { FileUploader } from '@/components/forms/file-uploader';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createAssignment } from '@/lib/server/actions';

const assignmentSchema = z.object({
  name: z.string().min(1, 'يرجى إدخال اسم المهمة'),
  description: z.string().optional(),
  type: z.enum(AssignmentTypes, 'يرجى اختيار نوع المهمة'),
  links: z
    .array(
      z.object({
        url: z.url('يرجى إدخال رابط صحيح'),
      })
    )
    .optional(),
  filesKeys: z.array(z.string()).optional(),
});

type AssignmentData = z.infer<typeof assignmentSchema>;

export function AddAssignmentSheet({
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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentData>({
    mode: 'onTouched',
    resolver: zodResolver(assignmentSchema),
  });

  const filesKeys = watch('filesKeys');
  const {
    fields: links,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control,
    name: 'links',
  });

  const [open, setOpen] = useState(false);

  const router = useRouter();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
      links.forEach((_, index) => removeLink(index));
      if (filesKeys && filesKeys.length > 0) {
        deleteFiles(filesKeys);
      }
    }
  };

  const onSubmit: SubmitHandler<AssignmentData> = async (data) => {
    try {
      const response = await createAssignment({
        levelSlug,
        weekId,
        programSlug,
        assignment: {
          name: data.name,
          description: data.description,
          type: data.type,
          links: data.links,
          filesKeys: data.filesKeys,
        },
      });
      if (!response.success) {
        throw new Error(response.error || 'Failed to create assignment');
      }

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
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant={buttonVariant}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مهمة
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-screen p-0 flex flex-col">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <SheetHeader className="px-3 pt-3 pb-2 shrink-0">
            <SheetTitle className="text-right">إضافة مهمة جديدة</SheetTitle>
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
                      <SelectTrigger size="sm" className="w-[100%] mb-2">
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
                              {
                                labels.dashboard.curriculum[
                                  t as AssignmentTypes
                                ]
                              }
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                <ErrorMessage message={errors.type?.message} />
              </div>

              {/* Attachments Section */}
              <div className="grid">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-right">المرفقات</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting}
                    onClick={() =>
                      appendLink({
                        url: '',
                      })
                    }
                  >
                    <Plus className="ml-1 h-3 w-3" />
                    إضافة رابط
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <FileUploader
                      compact={true}
                      onFilesChange={(uploadedFiles) => {
                        // @ts-ignore
                        setValue('filesKeys', uploadedFiles, {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>

                  {/* Links */}
                  {links.length > 0 && (
                    <div className="space-y-2">
                      {links.map((link, index) => (
                        <div key={link.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="https://example.com"
                              className="text-right"
                              {...register(`links.${index}.url`)}
                              disabled={isSubmitting}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLink(index)}
                              disabled={isSubmitting}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                          <ErrorMessage
                            message={errors.links?.[index]?.url?.message}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="gap-2 px-3 py-3 shrink-0 border-t flex flex-row">
            <SheetClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                إلغاء
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء المهمة'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function deleteFiles(keys: string[]) {
  keys.forEach(async (key) => {
    await fetch('/api/s3/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
  });
}
