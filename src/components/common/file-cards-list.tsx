'use client';

import { useState, useEffect } from 'react';
import { FileText, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { cn } from '@/lib/shared/utils';

type ExistingFileCardProps = {
  file: {
    id: string;
    name: string;
    fileKey: string;
    url: string | null;
  };
  onPressDelete: () => void;
  disabled?: boolean;
  isNew?: boolean;
};

export function ExistingFileCard({
  file,
  onPressDelete,
  disabled = false,
  isNew = false,
}: ExistingFileCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const isImage = /(png|jpe?g|gif|webp|avif)$/i.test(file.name);
  const isPdf = /\.pdf$/i.test(file.name);

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-200 w-28 h-28 sm:w-32 sm:h-32 flex flex-col',
        isNew ? 'border-primary/50 border-dashed' : 'border-border'
      )}
    >
      <div className="relative flex-1 w-full overflow-hidden bg-muted/20">
        <Button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPressDelete();
          }}
          disabled={disabled}
          variant="destructive"
          size="icon"
          className="absolute top-1 left-1 z-10 size-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-sm"
          title="حذف الملف"
        >
          <X className="size-3" />
        </Button>

        {isImage ? (
          <div className="relative w-full h-full">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center w-full h-full">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : file.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-muted/30">
                <FileText className="size-8" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-muted/30">
            <FileText className="size-8" />
          </div>
        )}

        {/* "New" badge */}
        {isNew && (
          <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
            جديد
          </div>
        )}
      </div>

      <div className="border-t bg-card h-9 px-2 flex items-center justify-between gap-2 shrink-0">
        <span
          className="text-xs font-medium truncate max-w-full"
          title={file.name}
        >
          {file.name}
        </span>
      </div>
    </Card>
  );
}
