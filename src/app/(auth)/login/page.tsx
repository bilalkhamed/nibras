'use client';

import Link from 'next/link';
import { Loader2Icon, Sparkles } from 'lucide-react';
import labels from '@/lib/labels.json';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loginSchema, LoginValues } from '@/lib/shared/auth-schemas';
import { FormField } from '@/components/forms/form-fields';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorMessage } from '@/components/forms/error-message';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const {
    handleSubmit,
    setError,
    control,

    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginValues>({
    mode: 'onTouched',
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (formData: LoginValues) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/dashboard');
      } else if (res.status === 401) {
        setError('root', {
          message:
            'البيانات المدخلة غير صحيحة. يرجى التحقق من المعرف وكلمة السر.',
        });
      } else {
        setError('root', {
          message: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
        });
      }
    } catch {
      setError('root', {
        message: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
      });
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="animate-in fade-in slide-in-from-bottom-2 w-full max-w-md duration-500">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            <Sparkles className="text-primary h-10 w-10" />
            <h1 className="from-primary to-secondary bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent">
              {labels.common.appName}
            </h1>
          </Link>
        </div>
        <Card
          className="border-border bg-card/90 shadow-2xl backdrop-blur"
          data-auth-mode="login"
        >
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="from-primary to-secondary bg-linear-to-r bg-clip-text text-2xl font-bold text-transparent leading-10">
              {labels.auth.loginTitle}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {labels.auth.loginSubtitle}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <Controller
                control={control}
                name="identifier"
                render={({ field: { onBlur, onChange, value } }) => (
                  <FormField
                    field="identifier"
                    label={labels.common.identifier}
                    placeholder="أدخلي المعرف"
                    type="text"
                    handleChange={onChange}
                    handleOnBlur={onBlur}
                    error={errors.identifier?.message || ''}
                    value={value}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onBlur, onChange, value } }) => (
                  <FormField
                    field="password"
                    label={labels.common.password}
                    handleChange={onChange}
                    handleOnBlur={onBlur}
                    type="password"
                    error={errors.password?.message || ''}
                    value={value}
                  />
                )}
              />

              <ErrorMessage message={errors.root?.message} />

              <Button
                className="w-full"
                variant="hook"
                size="lg"
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2Icon className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  labels.common.login
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-3">
              <div className="text-muted-foreground text-center text-sm">
                {labels.auth.noAccount}{' '}
                <Link
                  href="/signup"
                  className="text-primary hover:text-secondary font-semibold transition-colors"
                >
                  {labels.auth.signupLink}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary text-sm transition-colors"
          >
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
