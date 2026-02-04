import { FileTextIcon, Trash2Icon, Download } from 'lucide-react';

import { Button } from '../ui/button';
import { cn } from '@/lib/shared/utils';

export function FileCard({
  file,
  onPressDelete,
}: {
  file: { key: string; name: string; url: string };
  onPressDelete: (key: string) => void;
}) {
  // Check key, url, or name for file extension (in that order of priority)
  const sourceToCheck = file.key || file.url || file.name;
  const isImage = /(png|jpe?g|gif|webp|avif)(\?|$)/i.test(sourceToCheck);
  const isPdf = /\.pdf(\?|$)/i.test(sourceToCheck);

  return (
    <div
      className={cn(
        'group relative border rounded-xl overflow-hidden transition-all duration-200',
        'hover:shadow-md hover:border-primary/50',
        'border-border bg-card',
      )}
    >
      {/* Action buttons */}
      <div className="absolute top-2 left-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Download button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 rounded-full',
            'bg-background/80 backdrop-blur-sm shadow-sm',
            'hover:bg-primary hover:text-primary-foreground',
          )}
          onClick={() => window.open(file.url, '_blank')}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>

        {/* Delete button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7 rounded-full',
            'bg-background/80 backdrop-blur-sm shadow-sm',
            'text-destructive hover:bg-destructive hover:text-destructive-foreground',
          )}
          onClick={() => onPressDelete(file.key)}
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Preview area */}
      <div className="w-full aspect-video bg-muted/50 flex items-center justify-center relative overflow-hidden">
        {isPdf ? (
          <button
            type="button"
            onClick={() => window.open(file.url, '_blank')}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <FileTextIcon className="h-14 w-14 text-primary" />
          </button>
        ) : isImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-sm text-muted-foreground">لا يوجد معاينة</span>
        )}
      </div>

      {/* File info */}
      <div className="p-3 space-y-2">
        <div
          className="text-sm font-medium text-foreground truncate"
          title={file.name}
        >
          {file.name}
        </div>
      </div>
    </div>
  );
}
