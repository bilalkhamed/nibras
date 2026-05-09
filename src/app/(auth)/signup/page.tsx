'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { z } from 'zod';
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

import { useState } from 'react';
import { signupSchema } from '@/lib/shared/auth-schemas';
import { useRouter } from 'next/navigation';
import { FormField, PasswordField } from '@/components/forms/form-fields';
import { ApplicationsClosed } from './applications-closed';

type SignupValues = {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthYear: number;
};

export default function SignupPage() {
  const [errors, setErrors] = useState<{
    [key in keyof SignupValues]?: string;
  }>({});
  const [serverError, setServerError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [values, setValues] = useState<SignupValues>({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthYear: 2000,
  });

  const handleChange =
    (field: keyof SignupValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleOnBlur = (field: keyof SignupValues) => () => {
    const result = signupSchema.safeParse(values);
    if (!result.success) {
      const treeifiedError = z.treeifyError(result.error);

      const error = treeifiedError.properties?.[field]?.errors[0];

      setErrors((prev) => ({ ...prev, [field]: error }));
      setSuccess(false);
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setSuccess(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: { [key in keyof SignupValues]?: string } = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof SignupValues;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      setSuccess(false);
    } else {
      setErrors({});
      setSuccess(true);

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        // Redirect to login page or show success message
        router.replace('/account');
      } else if (res.status === 409) {
        // Handle server-side validation errors
        setErrors({ email: 'البريد الإلكتروني مستخدم بالفعل' });
      } else if (!res.ok) {
        // Handle other server errors
        setServerError('حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى.');
      }
    }
  };

  return <ApplicationsClosed />;
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              {labels.common.appName}
            </h1>
          </Link>
        </div>
        <Card
          className="border-border shadow-2xl backdrop-blur bg-card/90"
          data-auth-mode="signup"
        >
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              {labels.auth.signupTitle}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {labels.auth.signupSubtitle}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <FormField
                field="firstName"
                label="الاسم الأول"
                handleChange={handleChange('firstName')}
                handleOnBlur={handleOnBlur('firstName')}
                error={errors.firstName || ''}
                value={values.firstName}
              />
              <FormField
                field="middleName"
                label="اسم الأب"
                handleChange={handleChange('middleName')}
                handleOnBlur={handleOnBlur('middleName')}
                error={errors.middleName || ''}
                value={values.middleName}
              />
              <FormField
                field="lastName"
                label="اسم العائلة"
                handleChange={handleChange('lastName')}
                handleOnBlur={handleOnBlur('lastName')}
                error={errors.lastName || ''}
                value={values.lastName}
              />
              <FormField
                field="email"
                label={labels.common.email}
                type="email"
                handleChange={handleChange('email')}
                handleOnBlur={handleOnBlur('email')}
                error={errors.email || ''}
                value={values.email}
              />
              <FormField
                field="birthYear"
                label="سنة الميلاد بالميلادي"
                handleChange={handleChange('birthYear')}
                handleOnBlur={handleOnBlur('birthYear')}
                type="number"
                error={errors.birthYear || ''}
                value={values.birthYear.toString()}
              />
              <PasswordField
                field="password"
                label={labels.common.password}
                handleChange={handleChange('password')}
                handleOnBlur={handleOnBlur('password')}
                error={errors.password || ''}
                value={values.password}
              />

              <FormField
                field="confirmPassword"
                label={labels.common.confirmPassword}
                handleChange={handleChange('confirmPassword')}
                handleOnBlur={handleOnBlur('confirmPassword')}
                type="password"
                error={errors.confirmPassword || ''}
                value={values.confirmPassword}
              />

              <Button
                className="w-full"
                variant="hook"
                size="lg"
                type="submit"
                disabled={!success}
              >
                {labels.common.signup}
              </Button>
              {serverError && (
                <p className="text-xs text-destructive text-center">
                  {serverError}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-3">
              <div className="text-sm text-center text-muted-foreground">
                {labels.auth.hasAccount}{' '}
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:text-secondary transition-colors"
                >
                  {labels.auth.loginLink}
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
