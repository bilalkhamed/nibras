'use client';

import { ArrowRightIcon } from 'lucide-react';

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="cursor-pointer text-muted-foreground hover:text-primary flex items-center justify-center gap-1 mx-auto transition-colors"
    >
      <ArrowRightIcon className="h-4 w-4" />
      العودة للصفحة السابقة
    </button>
  );
}
