'use client';

import Link from 'next/link';
import { Info, Sparkles } from 'lucide-react';
import { set, z } from 'zod';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ReactNode, useState } from 'react';
import { signupSchema } from '@/lib/auth-schemas';
import { useRouter } from 'next/navigation';

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
      const data = await res.json();

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
                handleChange={handleChange}
                handleOnBlur={handleOnBlur}
                error={errors.firstName || ''}
                value={values.firstName}
              />
              <FormField
                field="middleName"
                label="اسم الأب"
                handleChange={handleChange}
                handleOnBlur={handleOnBlur}
                error={errors.middleName || ''}
                value={values.middleName}
              />
              <FormField
                field="lastName"
                label="اسم العائلة"
                handleChange={handleChange}
                handleOnBlur={handleOnBlur}
                error={errors.lastName || ''}
                value={values.lastName}
              />
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
                field="birthYear"
                label="سنة الميلاد بالميلادي"
                handleChange={handleChange}
                handleOnBlur={handleOnBlur}
                type="number"
                error={errors.birthYear || ''}
                value={values.birthYear.toString()}
              />
              <PasswordField
                field="password"
                label={labels.common.password}
                handleChange={handleChange}
                handleOnBlur={handleOnBlur}
                error={errors.password || ''}
                value={values.password}
              />

              <FormField
                field="confirmPassword"
                label={labels.common.confirmPassword}
                handleChange={handleChange}
                handleOnBlur={handleOnBlur}
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

type FormFieldProps = {
  field: keyof SignupValues;
  label: string;
  type?: 'text' | 'password' | 'email' | 'number';
  leftSlot?: ReactNode;
  error: string;
  value: string;
  handleChange: (
    field: keyof SignupValues
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOnBlur: (field: keyof SignupValues) => () => void;
};

function FormField({
  field,
  type = 'text',
  label,
  leftSlot,
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
      <div className="relative">
        {leftSlot}
        <Input
          id={field}
          type={type}
          placeholder={`أدخلي  ${label}`}
          value={value}
          className="border-border focus:border-primary focus:ring-primary"
          onChange={handleChange(field)}
          onBlur={handleOnBlur(field)}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function PasswordField(props: Omit<FormFieldProps, 'type' | 'leftSlot'>) {
  return (
    <FormField
      {...props}
      type="password"
      leftSlot={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>

            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-2">شروط كلمة السر:</p>
              <ul className="space-y-1 text-sm">
                <li>• على الأقل 8 أحرف</li>
                <li>• حرف كبير واحد على الأقل (A-Z)</li>
                <li>• حرف صغير واحد على الأقل (a-z)</li>
                <li>• رقم واحد على الأقل (0-9)</li>
                <li>• رمز واحد على الأقل (!@#$...)</li>
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    />
  );
}
