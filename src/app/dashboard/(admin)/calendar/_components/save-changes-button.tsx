'use client';

import * as React from 'react';
import { SaveIcon, CheckIcon } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { Button } from '@/components/ui/button';
import { useWeekManager } from './week-manager-context';

export function SaveChangesButton() {
  const { hasChanges, saveChanges } = useWeekManager();
  const [isSaving, setIsSaving] = React.useState(false);
  const [showSaved, setShowSaved] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await saveChanges();
    setIsSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  if (!hasChanges && !showSaved) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300',
        hasChanges || showSaved
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0',
      )}
    >
      <Button
        onClick={handleSave}
        disabled={isSaving || showSaved}
        className={cn(
          'gap-2 shadow-lg transition-all',
          showSaved && 'bg-emerald-600 hover:bg-emerald-600',
        )}
        size="lg"
      >
        {showSaved ? (
          <>
            <CheckIcon className="size-4" />
            <span>تم الحفظ</span>
          </>
        ) : (
          <>
            <SaveIcon className="size-4" />
            <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}</span>
          </>
        )}
      </Button>
    </div>
  );
}
