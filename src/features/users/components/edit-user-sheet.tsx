/**
 * EditUserSheet Component
 *
 * Sheet dialog for editing an existing user's core info and student profile.
 * Uses RHF + zod, matching the style of EditAssignmentSheet.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PencilIcon, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage } from '@/components/forms/error-message';
import SearchSelect from '@/components/common/search-select';
import labels from '@/lib/labels.json';
import { GradeLevel } from '@prisma/client';
import {
  editUserSchema,
  editUserProfileSchema,
  EditUserInput,
  EditUserProfileInput,
} from '../types';
import { editUserAction } from '../actions';

// ============================================================================
// Types
// ============================================================================

type EditUserSheetProps = {
  /** User ID being edited */
  userId: string;
  /** Default values for core user fields */
  defaultUserValues: EditUserInput & { email?: string | null };
  /** Default values for profile fields */
  defaultProfileValues?: {
    gradeLevel?: GradeLevel | null;
    address?: string | null;
    motherFullName?: string | null;
    motherPhone?: string | null;
  };
};

// ============================================================================
// Combined form data type
// ============================================================================

type EditUserFormData = EditUserInput & EditUserProfileInput;

// ============================================================================
// Grade level options
// ============================================================================

const gradeLevelOptions = Object.entries(labels.gradeLevels).map(
  ([key, label]) => ({
    id: key,
    label,
  }),
);

// ============================================================================
// Component
// ============================================================================

export function EditUserSheet({
  userId,
  defaultUserValues,
  defaultProfileValues,
}: EditUserSheetProps) {
  const [open, setOpen] = useState(false);

  // We merge both schemas for a single unified form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormData>({
    mode: 'onTouched',
    resolver: zodResolver(editUserSchema.merge(editUserProfileSchema)),
    defaultValues: {
      firstName: defaultUserValues.firstName ?? '',
      middleName: defaultUserValues.middleName ?? '',
      lastName: defaultUserValues.lastName ?? '',
      email: defaultUserValues.email ?? '',
      birthYear: defaultUserValues.birthYear,
      country: defaultUserValues.country ?? '',
      gradeLevel: defaultProfileValues?.gradeLevel ?? undefined,
      address: defaultProfileValues?.address ?? '',
      motherFullName: defaultProfileValues?.motherFullName ?? '',
      motherPhone: defaultProfileValues?.motherPhone ?? '',
    },
  });

  const router = useRouter();
  const handleCancel = () => setOpen(false);

  const onSubmit: SubmitHandler<EditUserFormData> = async (data) => {
    const { gradeLevel, address, motherFullName, motherPhone, ...userFields } = data;

    const result = await editUserAction(
      userId,
      userFields,
      { gradeLevel, address, motherFullName, motherPhone },
    );

    if (result.success) {
      toast.success('تم تحديث بيانات المستخدم بنجاح.');
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <PencilIcon className="h-4 w-4" />
          تعديل
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-screen p-0 flex flex-col">
        <SheetDescription className="sr-only">
          تعديل بيانات المستخدم
        </SheetDescription>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          {/* Header */}
          <SheetHeader className="px-3 pt-3 pb-2 shrink-0">
            <SheetTitle className="text-right">تعديل بيانات المستخدم</SheetTitle>
          </SheetHeader>

          {/* Scrollable body */}
          <ScrollArea className="flex-1 min-h-0" dir="rtl">
            <div className="grid gap-6 px-4 py-6">

              {/* ── Section 1: Core info ── */}
              <div className="grid gap-5">
                {/* Name row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1">
                    <Label htmlFor="firstName" className="text-right">
                      {labels.dashboard.users.firstName}
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="الاسم الأول"
                      {...register('firstName')}
                      className="text-right"
                      disabled={isSubmitting}
                    />
                    <ErrorMessage message={errors.firstName?.message} />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="middleName" className="text-right">
                      {labels.dashboard.users.middleName}
                    </Label>
                    <Input
                      id="middleName"
                      placeholder="اسم الأب"
                      {...register('middleName')}
                      className="text-right"
                      disabled={isSubmitting}
                    />
                    <ErrorMessage message={errors.middleName?.message} />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="lastName" className="text-right">
                      {labels.dashboard.users.lastName}
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="اسم العائلة"
                      {...register('lastName')}
                      className="text-right"
                      disabled={isSubmitting}
                    />
                    <ErrorMessage message={errors.lastName?.message} />
                  </div>
                </div>

                {/* Email */}
                <div className="grid gap-1">
                  <Label htmlFor="email" className="text-right">
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    {...register('email')}
                    className="text-right"
                    disabled={isSubmitting}
                    dir="ltr"
                  />
                  <ErrorMessage message={errors.email?.message} />
                </div>

                {/* Birth year */}
                <div className="grid gap-1">
                  <Label htmlFor="birthYear" className="text-right">
                    {labels.dashboard.users.birthYear}
                  </Label>
                  <Input
                    id="birthYear"
                    type="number"
                    inputMode="numeric"
                    placeholder="مثال: 2005"
                    min={1900}
                    max={new Date().getFullYear() - 11}
                    {...register('birthYear', { valueAsNumber: true })}
                    className="text-right"
                    disabled={isSubmitting}
                  />
                  <ErrorMessage message={errors.birthYear?.message} />
                </div>

                {/* Country */}
                <div className="grid gap-1">
                  <Label className="text-right">
                    {labels.dashboard.users.country}
                  </Label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field: { onChange, value, onBlur } }) => (
                      <SearchSelect
                        options={Object.entries(labels.countries).map(
                          ([key, label]) => ({ id: key, label }),
                        )}
                        placeholder="اختر الدولة"
                        searchPlaceholder="ابحثي عن الدولة"
                        value={value ?? ''}
                        onChange={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <ErrorMessage message={errors.country?.message} />
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    الملف الشخصي
                    <span className="ms-1 normal-case text-muted-foreground/70">
                      (اختياري)
                    </span>
                  </span>
                </div>
              </div>

              {/* ── Section 2: Profile info ── */}
              <div className="grid gap-5">
                {/* Academic level */}
                <div className="grid gap-1">
                  <Label className="text-right">
                    المرحلة الدراسية{' '}
                    <span className="text-muted-foreground text-xs">(اختياري)</span>
                  </Label>
                  <Controller
                    name="gradeLevel"
                    control={control}
                    render={({ field: { onChange, value, onBlur } }) => (
                      <SearchSelect
                        options={gradeLevelOptions}
                        placeholder="اختر المرحلة الدراسية"
                        searchPlaceholder="ابحث..."
                        value={value ?? ''}
                        onChange={(v) => onChange(v || null)}
                        onBlur={onBlur}
                      />
                    )}
                  />
                  <ErrorMessage message={errors.gradeLevel?.message} />
                </div>

                {/* Address */}
                <div className="grid gap-1">
                  <Label htmlFor="address" className="text-right">
                    العنوان{' '}
                    <span className="text-muted-foreground text-xs">(اختياري)</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="المدينة / الحي..."
                    {...register('address')}
                    className="text-right"
                    disabled={isSubmitting}
                  />
                  <ErrorMessage message={errors.address?.message} />
                </div>

                {/* Mother name */}
                <div className="grid gap-1">
                  <Label htmlFor="motherFullName" className="text-right">
                    اسم الأم{' '}
                    <span className="text-muted-foreground text-xs">(اختياري)</span>
                  </Label>
                  <Input
                    id="motherFullName"
                    placeholder="الاسم الكامل للأم"
                    {...register('motherFullName')}
                    className="text-right"
                    disabled={isSubmitting}
                  />
                  <ErrorMessage message={errors.motherFullName?.message} />
                </div>

                {/* Mother phone */}
                <div className="grid gap-1">
                  <Label htmlFor="motherPhone" className="text-right">
                    رقم هاتف الأم{' '}
                    <span className="text-muted-foreground text-xs">(اختياري)</span>
                  </Label>
                  <Input
                    id="motherPhone"
                    placeholder="+970 5x xxx xxxx"
                    {...register('motherPhone')}
                    className="text-right"
                    disabled={isSubmitting}
                    dir="ltr"
                  />
                  <ErrorMessage message={errors.motherPhone?.message} />
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <SheetFooter className="gap-2 px-3 py-3 shrink-0 border-t flex flex-row">
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={handleCancel}
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
                'حفظ التعديلات'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
