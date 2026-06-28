'use client';

import labels from '@/lib/labels.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@/components/ui/multi-select';
import SearchSelect from '@/components/common/search-select';
import { useEffect, useState, useTransition } from 'react';
import { ADMIN_ROLE, Cohort, STUDENT_ROLE } from '@/types/types';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2Icon } from 'lucide-react';
import { InviteCodeModal } from './invite-code-modal';
import { toast } from 'sonner';
import { ErrorMessage } from '@/components/forms/error-message';
import { createUserAction } from '../actions';
import { Role } from '@prisma/client';
import { CreateUserInput, createUserSchema } from '../types';

type AddUserFormProps = {
  cohortId?: string;
  programs?: { id: string; name: string }[];
};

export function AddUserForm({ cohortId, programs = [] }: AddUserFormProps) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [isLoadingCohorts, setIsLoadingCohorts] = useState(true);

  useEffect(() => {
    const fetchCohorts = async () => {
      try {
        setIsLoadingCohorts(true);
        const url = cohortId ? `/api/cohorts/${cohortId}` : '/api/cohorts';
        const response = await fetch(url);

        if (!response.ok) {
          console.error('Failed to fetch cohorts:', response.statusText);
          setCohorts([]);
          return;
        }

        const data = await response.json();

        const cohortsData = cohortId ? [data.cohort] : data.cohorts;
        setCohorts(cohortsData.filter((c: Cohort | undefined) => c != null));
      } catch (error) {
        console.error('Error fetching cohorts:', error);
        setCohorts([]);
      } finally {
        setIsLoadingCohorts(false);
      }
    };
    fetchCohorts();
  }, [cohortId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [createdUserName, setCreatedUserName] = useState('');
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    mode: 'onTouched',
    defaultValues: {
      role: STUDENT_ROLE,
      cohortId: cohortId || undefined,
      programIds: [],
    },
  });

  const onSubmit: SubmitHandler<CreateUserInput> = async (data) => {
    startTransition(async () => {
      const result = await createUserAction(data);

      if (!result.success) {
        toast.error(
          result.error ||
            'حدث خطأ أثناء إنشاء المستخدم. الرجاء المحاولة مرة أخرى.',
          { duration: 2000 },
        );
        return;
      }

      setInviteCode(result.inviteCode);
      setModalOpen(true);
      setCreatedUserName(`${data.firstName} ${data.lastName}`);
      reset();
    });
  };

  return (
    <>
      <Card className="border-border shadow-lg bg-card/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-lg font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            {labels.dashboard.users.addUser}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 mb-3   md:col-span-2">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label>{labels.dashboard.users.firstName}</Label>
                    <Input
                      id="firstName"
                      placeholder="الاسم الأول"
                      {...register('firstName')}
                    />
                    <ErrorMessage message={errors.firstName?.message} />
                  </div>
                  <div className="space-y-1">
                    <Label>{labels.dashboard.users.middleName}</Label>

                    <Input
                      id="middleName"
                      placeholder="اسم الأب"
                      {...register('middleName')}
                    />
                    <ErrorMessage message={errors.middleName?.message} />
                  </div>
                  <div className="space-y-1">
                    <Label>{labels.dashboard.users.lastName}</Label>

                    <Input
                      id="lastName"
                      placeholder="اسم العائلة"
                      {...register('lastName')}
                    />
                    <ErrorMessage message={errors.lastName?.message} />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="birthYear">
                  {labels.dashboard.users.birthYear}
                </Label>
                <Input
                  id="birthYear"
                  placeholder="مثال: 2005"
                  type="number"
                  inputMode="numeric"
                  min={1900}
                  max={new Date().getFullYear() - 11}
                  {...register('birthYear', { valueAsNumber: true })}
                />
                <ErrorMessage message={errors.birthYear?.message} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cohort">{labels.dashboard.users.cohort}</Label>
                <Controller
                  name="cohortId"
                  control={control}
                  render={({ field: { onChange, value, onBlur } }) => (
                    <Select
                      dir="rtl"
                      value={value || ''}
                      onValueChange={(v) => {
                        onChange(v);
                        onBlur();
                      }}
                      disabled={!!cohortId}
                    >
                      <SelectTrigger
                        id="cohort"
                        className="w-full border-border bg-card text-foreground focus:ring-primary"
                        onBlur={onBlur}
                        onChange={onChange}
                        value={value}
                      >
                        <SelectValue
                          placeholder={
                            isLoadingCohorts ? 'جاري التحميل...' : 'اختر الدفعة'
                          }
                        />
                      </SelectTrigger>

                      <SelectContent className="bg-card text-foreground border border-border">
                        {isLoadingCohorts ? (
                          <SelectItem value="loading" disabled>
                            جاري التحميل...
                          </SelectItem>
                        ) : cohorts.length === 0 ? (
                          <SelectItem value="no-cohorts" disabled>
                            لا توجد دفعات
                          </SelectItem>
                        ) : (
                          cohorts.map((cohort) => {
                            return (
                              <SelectItem
                                key={cohort.id}
                                value={cohort.id}
                                className="cursor-pointer"
                              >
                                {cohort.name}
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                <ErrorMessage message={errors.cohortId?.message} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="country">
                  {labels.dashboard.users.country}
                </Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <SearchSelect
                      options={Object.entries(labels.countries).map(
                        ([key, value]) => ({
                          id: key,
                          label: value,
                        }),
                      )}
                      placeholder="اختر الدولة"
                      searchPlaceholder="ابحثي عن الدولة"
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                <ErrorMessage message={errors.country?.message} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="role">{labels.dashboard.users.role}</Label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field: { onBlur, value, onChange } }) => (
                    <Select
                      dir="rtl"
                      value={value || ''}
                      onValueChange={(v) => {
                        onChange(v);
                        onBlur();
                      }}
                    >
                      <SelectTrigger
                        id="role"
                        className="w-full border-border bg-card text-foreground focus:ring-primary"
                      >
                        <SelectValue placeholder="اختر الرتبة" />
                      </SelectTrigger>

                      <SelectContent className="bg-card text-foreground border border-border">
                        {Object.entries(Role).map(([key]) => {
                          if (key === ADMIN_ROLE) return null;
                          if (
                            cohortId &&
                            key !== STUDENT_ROLE &&
                            key !== 'supervisor'
                          ) {
                            return null;
                          }
                          return (
                            <SelectItem
                              key={key}
                              value={key}
                              className="cursor-pointer"
                            >
                              {labels.dashboard.users[key as keyof typeof Role]}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                />
                <ErrorMessage message={errors.role?.message} />
              </div>
              {watch('role') === 'program_manager' && (
                <div className="space-y-1">
                  <Label>البرامج المدارة</Label>
                  <Controller
                    name="programIds"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <MultiSelect
                        values={value || []}
                        onValuesChange={onChange}
                      >
                        <MultiSelectTrigger>
                          <MultiSelectValue placeholder="اختر البرامج" />
                        </MultiSelectTrigger>
                        <MultiSelectContent search={{ placeholder: 'ابحث عن برنامج...', emptyMessage: 'لا يوجد برامج' }}>
                          {programs.map((prog) => (
                            <MultiSelectItem key={prog.id} value={prog.id}>
                              {prog.name}
                            </MultiSelectItem>
                          ))}
                        </MultiSelectContent>
                      </MultiSelect>
                    )}
                  />
                  <ErrorMessage message={errors.programIds?.message} />
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size={'md'}
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2Icon className="h-6 w-6 animate-spin text-amber-200" />
                ) : (
                  labels.dashboard.users.create
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <InviteCodeModal
        inviteCode={inviteCode}
        open={modalOpen}
        userName={createdUserName || 'المستخدم الجديد'}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
