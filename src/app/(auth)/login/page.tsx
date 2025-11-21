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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useActionState, useState } from 'react';
import { loginSchema } from '@/lib/auth-schemas';
import { login } from './actions';

type LoginValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [errors, setErrors] = useState<{
    [key in keyof LoginValues]?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  const [values, setValues] = useState<LoginValues>({
    email: '',
    password: '',
  });

  const handleChange =
    (field: keyof LoginValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleOnBlur = (field: keyof LoginValues) => () => {
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const treeifiedError = z.treeifyError(result.error);

      let error = treeifiedError.properties?.[field]?.errors[0];

      setErrors((prev) => ({ ...prev, [field]: error }));
      setSuccess(false);
    } else {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setSuccess(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: { [key in keyof LoginValues]?: string } = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof LoginValues;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      setSuccess(false);
    } else {
      setErrors({});
      setSuccess(true);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (data.success) {
        window.location.href = '/account';
      } else if (res.status === 401) {
        setErrors({ password: 'البريد الإلكتروني أو كلمة السر غير صحيحة' });
      }
    }
  };

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
          data-auth-mode="login"
        >
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              {labels.auth.loginTitle}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {labels.auth.loginSubtitle}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <FormField
                field="email"
                label={labels.common.email}
                type="email"
                handleChange={handleChange}
                handleOnBlur={handleOnBlur}
                error={errors.email || ''}
                value={values.email}
              />
              <FormField
                field="password"
                label={labels.common.password}
                handleChange={handleChange}
                handleOnBlur={handleOnBlur}
                type="password"
                error={errors.password || ''}
                value={values.password}
              />

              <Button
                className="w-full"
                variant="hook"
                size="lg"
                type="submit"
                disabled={!success}
              >
                {labels.common.login}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-3">
              <div className="text-sm text-center text-muted-foreground">
                {labels.auth.noAccount}{' '}
                <Link
                  href="/signup"
                  className="font-semibold text-primary hover:text-secondary transition-colors"
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
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

type FormFieldProps = {
  field: keyof LoginValues;
  label: string;
  type?: 'text' | 'password' | 'email';
  error: string;
  value: string;
  handleChange: (
    field: keyof LoginValues
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOnBlur: (field: keyof LoginValues) => () => void;
};

function FormField({
  field,
  type = 'text',
  label,
  error,
  value,
  handleChange,
  handleOnBlur,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-foreground">
        {label}
      </Label>
      <Input
        id={field}
        type={type}
        placeholder={`أدخلي  ${label}`}
        value={value}
        className="border-border focus:border-primary focus:ring-primary"
        onChange={handleChange(field)}
        onBlur={handleOnBlur(field)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
