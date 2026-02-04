/**
 * AssignmentForm Component
 *
 * Reusable form for creating and editing assignments.
 * Includes fields for name, description, type, links, and file uploads.
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
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
import { LinkManager } from './link-manager';
import { FileUploader } from './file-uploader';
import { FilesCardsList } from './files-cards-list';
import {
  type AssignmentFormData,
  type AttachedFile,
  type Link,
  assignmentFormSchema,
} from '../../types';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';

// Re-export for consumers that might need it
export type { AssignmentFormData, Link } from '../../types';

// ============================================================================
// Form Component
// ============================================================================

type AssignmentFormContentProps = {
  /** Form title */
  title: string;
  /** Submit button label */
  submitLabel: string;
  /** Default values for editing */
  defaultValues?: {
    name: string;
    description: string | null;
    type: AssignmentTypes;
    links?: Link[];
    files?: AttachedFile[];
    allowFileSubmission: boolean;
    allowTextSubmission: boolean;
  };
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Callback when form is submitted */
  onSubmit: (data: AssignmentFormData) => Promise<void>;
};

/**
 * Assignment form content used in create/edit sheets
 */
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
    watch,
    setValue,
    getValues,
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
          files: defaultValues.files || [],
          newFileKeys: [],
          allowFileSubmission: defaultValues.allowFileSubmission,
          allowTextSubmission: defaultValues.allowTextSubmission,
        }
      : {
          newFileKeys: [],
          allowFileSubmission: false,
          allowTextSubmission: false,
        },
  });

  // Register uncontrolled fields
  useEffect(() => {
    register('files');
    register('newFileKeys');
  }, [register]);

  const handleFormSubmit: SubmitHandler<AssignmentFormData> = async (data) => {
    await onSubmit(data);
  };
  const files = watch('files');

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

          <div className="flex justify-between items-center">
            <Field orientation="horizontal">
              <Controller
                control={control}
                name="allowTextSubmission"
                render={({ field }) => (
                  <Checkbox
                    id="allowTextSubmission"
                    className="cursor-pointer"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <FieldLabel htmlFor="allowTextSubmission" className="mb-0">
                طلب تقديم نص
              </FieldLabel>
            </Field>
            <Field orientation="horizontal">
              <Controller
                control={control}
                name="allowFileSubmission"
                render={({ field }) => (
                  <Checkbox
                    id="allowFileSubmission"
                    className="cursor-pointer"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <FieldLabel htmlFor="allowFileSubmission" className="mb-0">
                طلب تقديم ملف
              </FieldLabel>
            </Field>
          </div>
        </div>

        {/* Links Section */}
        <LinkManager control={control} errors={errors.links} />

        {/* File Upload Section */}
        <div className="px-3 mt-3">
          <FileUploader
            onFileUpload={(fileKey) => {
              const current = getValues('newFileKeys') || [];
              setValue('newFileKeys', [...current, fileKey]);
            }}
            onFileDelete={(fileKey) => {
              const current = getValues('newFileKeys') || [];
              setValue(
                'newFileKeys',
                current.filter((key) => key !== fileKey),
              );
            }}
          />
        </div>

        {/* Existing Files Section (for editing) */}
        <FilesCardsList
          files={files || []}
          onFileDelete={(fileKey) => {
            const updatedFiles = (files || []).filter(
              (file) => file.key !== fileKey,
            );
            setValue('files', updatedFiles);
          }}
        />
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
