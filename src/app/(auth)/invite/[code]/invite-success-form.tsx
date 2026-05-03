'use client';

import labels from '@/lib/labels.json';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Controller, useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InvitedUserData, invitedUserSchema } from '@/lib/shared/auth-schemas';
import { FormField, PasswordField } from '@/components/forms/form-fields';
import { Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ErrorMessage } from '@/components/forms/error-message';
import Image from 'next/image';

export function InviteSuccessForm({
  user,
  inviteCode,
}: {
  user: { firstName: string; id: string };
  inviteCode: string;
}) {
  const router = useRouter();

  const {
    formState: { errors, isSubmitting },
    control,
    handleSubmit,
    setError,
  } = useForm<InvitedUserData>({
    resolver: zodResolver(invitedUserSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<InvitedUserData> = async (data) => {
    const res = await fetch('/api/auth/invite/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, inviteCode }),
    });

    if (!res.ok) {
      const errorData = await res.json();

      if (res.status === 409) {
        if (errorData.field === 'email') {
          setError('email', {
            message:
              'هذا البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني مختلف.',
          });
          return;
        }
        if (errorData.field === 'username') {
          setError('username', {
            message:
              'اسم المستخدم هذا مستخدم بالفعل. يرجى اختيار اسم مستخدم مختلف.',
          });
          return;
        }
      } else {
        setError('root', {
          message: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
        });
      }

      return;
    }

    localStorage.setItem('name', user.firstName);
    router.push('/dashboard');
  };

  return (
    <Card className="border-border shadow-2xl backdrop-blur bg-card/90">
      <CardHeader className="space-y-1 text-center">
        <Image
          src={'/logo.svg'}
          alt="نبراس"
          width={150}
          height={150}
          className="mx-auto"
        />
        <CardTitle className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
          مرحبًا بك، {user.firstName}!
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          أدخلي اسم المعرف وكلمة المرور لإكمال التسجيل.
          <br />
          يستخدم اسم المعرف لتسجيل دخولك لاحقًا.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value, onBlur } }) => (
              <FormField
                field="username"
                type="text"
                value={value || ''}
                error={errors.username?.message}
                handleOnBlur={onBlur}
                handleChange={onChange}
                label={`المعرف`}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <FormField
                field="email"
                type="email"
                value={value || ''}
                error={errors.email?.message}
                handleOnBlur={onBlur}
                handleChange={onChange}
                label={`${labels.common.email} (إن وجد)`}
              />
            )}
          />

          <div className="space-y-2">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => {
                console.log(typeof onChange, onBlur, value);
                return (
                  <PasswordField
                    field="password"
                    value={value || ''}
                    error={errors.password?.message}
                    handleOnBlur={onBlur}
                    handleChange={onChange}
                    label={labels.common.password}
                  />
                );
              }}
            />
          </div>

          <div className="space-y-2">
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value, onBlur } }) => {
                console.log(typeof onChange, onBlur, value);
                return (
                  <FormField
                    field="confirmPassword"
                    type="password"
                    value={value || ''}
                    error={errors.confirmPassword?.message}
                    handleOnBlur={onBlur}
                    handleChange={onChange}
                    label={labels.common.confirmPassword}
                  />
                );
              }}
            />
          </div>

          <ErrorMessage message={errors.root?.message} />

          <Button
            className="w-full"
            variant="hook"
            size="lg"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2Icon className="h-6 w-6 animate-spin text-primary" />
            ) : (
              'إكمال التسجيل'
            )}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
