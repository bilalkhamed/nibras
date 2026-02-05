'use client';

import { Share2 } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

interface ShareButtonProps {
  title: string;
}

export function ShareButton({ title }: ShareButtonProps) {
  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error occurred
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground',
        'transition-colors hover:border-primary hover:text-primary',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
      )}
      onClick={handleShare}
      aria-label="مشاركة المقال"
    >
      <Share2 className="size-4" aria-hidden="true" />
      <span>مشاركة</span>
    </button>
  );
}
