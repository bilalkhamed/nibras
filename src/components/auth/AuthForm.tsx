import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import labels from '@/lib/labels.json';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

type Field = {
  id: string;
  type?: string;
  placeholder?: string;
  label: string;
};

interface AuthFormProps {
  mode: 'login' | 'signup';
  title: string;
  subtitle: string;
  submitLabel: string;
  fields: Field[];
  alternateText: string;
  alternateHref: string;
  alternateLinkLabel: string;
}

export function AuthForm(props: AuthFormProps) {
  const {
    mode,
    title,
    subtitle,
    submitLabel,
    fields,
    alternateText,
    alternateHref,
    alternateLinkLabel,
  } = props;

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
          data-auth-mode={mode}
        >
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              {title}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((f) => (
              <div key={f.id} className="space-y-2">
                <Label htmlFor={f.id} className="text-foreground">
                  {f.label}
                </Label>
                <Input
                  id={f.id}
                  type={f.type || 'text'}
                  placeholder={f.placeholder}
                  className="border-border focus:border-primary focus:ring-primary"
                />
              </div>
            ))}
            <Button className="w-full" variant="hook" size="lg">
              {submitLabel}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              {alternateText}{' '}
              <Link
                href={alternateHref}
                className="font-semibold text-primary hover:text-secondary transition-colors"
              >
                {alternateLinkLabel}
              </Link>
            </div>
          </CardFooter>
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
