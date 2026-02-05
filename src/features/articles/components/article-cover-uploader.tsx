/**
 * ArticleCoverUploader Component
 *
 * Image upload component specifically for article cover images.
 * Uses the existing FileUploader component with customizations.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileUploader } from '@/features/assignments/components/admin/file-uploader';
import { ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';

type ArticleCoverUploaderProps = {
  /** Current cover image key */
  value: string | null | undefined;
  /** Callback when image changes */
  onChange: (key: string | null) => void;
  /** Whether the uploader is disabled */
  disabled?: boolean;
};

/**
 * Fetch presigned URL from API
 */
async function fetchPresignedUrl(key: string): Promise<string | null> {
  try {
    const response = await fetch('/api/s3/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.success ? data.url : null;
  } catch {
    return null;
  }
}

/**
 * Cover image uploader for articles
 */
export function ArticleCoverUploader({
  value,
  onChange,
  disabled = false,
}: ArticleCoverUploaderProps) {
  const [imageError, setImageError] = useState(false);
  const [showUploader, setShowUploader] = useState(!value);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  // Fetch presigned URL when value changes
  useEffect(() => {
    let cancelled = false;

    async function loadPreviewUrl() {
      if (!value) {
        setPreviewUrl(null);
        return;
      }

      setIsLoadingUrl(true);
      setImageError(false);

      const url = await fetchPresignedUrl(value);

      if (!cancelled) {
        setPreviewUrl(url);
        setIsLoadingUrl(false);
        if (!url) {
          setImageError(true);
        }
      }
    }

    loadPreviewUrl();

    return () => {
      cancelled = true;
    };
  }, [value]);

  const handleFileUpload = useCallback(
    (fileKey: string) => {
      onChange(fileKey);
      setShowUploader(false);
      setImageError(false);
    },
    [onChange],
  );

  const handleFileDelete = useCallback(() => {
    onChange(null);
    setShowUploader(true);
    setImageError(false);
    setPreviewUrl(null);
  }, [onChange]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Show loading state while fetching presigned URL
  if (value && isLoadingUrl) {
    return (
      <div className="aspect-video rounded-lg border border-border bg-muted flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        <span className="text-sm text-muted-foreground">
          جاري تحميل الصورة...
        </span>
      </div>
    );
  }

  // Show preview if we have a valid URL
  if (!showUploader && previewUrl && !imageError) {
    return (
      <div className="relative group">
        <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="صورة الغلاف"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleFileDelete}
            disabled={disabled}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            إزالة
          </Button>
        </div>
      </div>
    );
  }

  // Show placeholder if we have a key but image failed to load
  if (value && imageError) {
    return (
      <div className="aspect-video rounded-lg border border-border bg-muted flex flex-col items-center justify-center gap-2">
        <ImageIcon className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">تعذر تحميل الصورة</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFileDelete}
          disabled={disabled}
        >
          تغيير الصورة
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(disabled && 'opacity-50 pointer-events-none')}>
      <FileUploader
        maxFiles={1}
        maxSize={5 * 1024 * 1024} // 5MB
        compact={true}
        onFileUpload={handleFileUpload}
        onFileDelete={handleFileDelete}
      />
    </div>
  );
}
