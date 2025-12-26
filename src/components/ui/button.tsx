'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/shared/utils';

const buttonVariants = cva(
  // base styles for *all* buttons
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background cursor-pointer',
  {
    variants: {
      variant: {
        // main CTA (soft gold)
        primary: [
          'bg-primary text-primary-foreground hover:bg-primary-muted',
          // shared motion
          'shadow-sm hover:shadow-md',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none',
        ].join(' '),

        // secondary important action (coral)
        secondary: [
          'bg-secondary text-secondary-foreground hover:bg-secondary-muted',
          'shadow-sm hover:shadow-md',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none',
        ].join(' '),

        // special / highlighted actions (indigo)
        accent: [
          'bg-accent text-accent-foreground hover:bg-accent-muted',
          'shadow-sm hover:shadow-md',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none',
        ].join(' '),

        // soft / low-emphasis button
        subtle: [
          'bg-muted text-foreground hover:bg-muted/80',
          'shadow-sm hover:shadow-md',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none',
        ].join(' '),

        // bordered button
        outline: [
          'border border-border bg-card text-foreground hover:bg-muted',
          'shadow-sm hover:shadow-md',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none',
        ].join(' '),

        outlinePrimary: [
          'border border-primary bg-card text-primary hover:bg-primary/10',
          'shadow-sm hover:shadow-md',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none',
        ].join(' '),

        // bare, for icons / minimal actions
        ghost: [
          'bg-transparent text-foreground hover:bg-muted/60',
          'shadow-none hover:shadow-none', // no shadow for ghost
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-60',
        ].join(' '),

        // destructive actions
        destructive: [
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          'shadow-sm hover:shadow-md',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none',
        ].join(' '),

        // text-style button
        link: [
          'bg-transparent text-secondary underline-offset-4 hover:underline',
          'shadow-none hover:shadow-none',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-60',
        ].join(' '),

        // 🪝 hero "start" button – fancier motion
        hook: [
          // base gradient
          'bg-gradient-to-l from-primary to-secondary',
          'text-primary-foreground',
          // on hover: flip gradient
          'hover:from-secondary hover:to-primary',
          // subtle motion
          'shadow-md hover:shadow-lg',
          'transition-all duration-300 ease-out',
          'hover:-translate-y-0.5 hover:scale-[1.02]',
          'active:translate-y-0 active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none',
        ].join(' '),
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { buttonVariants };
