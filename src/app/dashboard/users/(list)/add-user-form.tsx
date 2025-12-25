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
import SearchSelect from '@/components/search-select';
import { useEffect, useState } from 'react';
import { Cohort, STUDENT_ROLE } from '@/types/types';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import {
  createUserSchema as formSchema,
  CreateUserData as FormData,
} from '@/lib/auth-schemas';
import { Loader2Icon } from 'lucide-react';
import { InviteCodeModal } from './invite-code-modal';
import { toast } from 'sonner';

export function AddUserForm() {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  useEffect(() => {
    const fetchCohorts = async () => {
      const response = await fetch('/api/cohorts');
      const data = await response.json();
      setCohorts(data.cohorts);
    };
    fetchCohorts();
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      role: STUDENT_ROLE,
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) {
      toast.error(
        result?.message ||
          'حدث خطأ أثناء إنشاء المستخدم. الرجاء المحاولة مرة أخرى.',
        { duration: 2000 }
      );
      return;
    }

    setModalOpen(true);
    console.log(data, errors);
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
                  // pattern="[0-9]*"
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
                    >
                      <SelectTrigger
                        id="cohort"
                        className="w-full border-border bg-card text-foreground focus:ring-primary"
                        onBlur={onBlur}
                        onChange={onChange}
                        value={value}
                      >
                        <SelectValue placeholder="اختر الدفعة" />
                      </SelectTrigger>

                      <SelectContent className="bg-card text-foreground border border-border">
                        {cohorts.map((cohort) => {
                          return (
                            <SelectItem
                              key={cohort.id}
                              value={cohort.id}
                              className="cursor-pointer"
                            >
                              {cohort.name}
                            </SelectItem>
                          );
                        })}
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
                  render={({ field: { onChange, onBlur, value } }) => (
                    <SearchSelect
                      options={Object.entries(labels.countries).map(
                        ([key, value]) => ({
                          id: key,
                          label: value,
                        })
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
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>

                      <SelectContent className="bg-card text-foreground border border-border">
                        <SelectItem value="student" className="cursor-pointer">
                          طالبة
                        </SelectItem>
                        <SelectItem
                          value="supervisor"
                          className="cursor-pointer"
                        >
                          مشرفة
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <ErrorMessage message={errors.role?.message} />
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="primary"
                size={'md'}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2Icon className="h-6 w-6 animate-spin text-amber-200" />
                ) : (
                  labels.dashboard.users.create
                )}
              </Button>
              <br />
              <Button variant="outline" size={'md'}>
                {labels.dashboard.users.importCsv}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <InviteCodeModal
        inviteCode="7SMMHS.02b7105ed6fe31389531a7d8921f3660da31c623fde2f9a263dd55c6f5a35e84"
        open={modalOpen}
        userName={getValues('firstName') || 'المستخدم الجديد'}
        onOpenChange={setModalOpen}
      />
    </>
  );
}

function ErrorMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}
