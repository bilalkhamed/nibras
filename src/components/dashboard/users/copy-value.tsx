'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';

interface CopyValueProps {
  label: string;
  value: string;
  className?: string;
}

export function CopyValue({ label, value, className }: CopyValueProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy', error);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <span>{label}</span>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border bg-card/60 px-3 py-2 shadow-sm">
        <span className="text-sm break-all text-foreground">{value}</span>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          className="h-8 w-8"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}
