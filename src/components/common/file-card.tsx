import { FileText, X } from 'lucide-react';

import { Button } from '../ui/button';
import { Card, CardFooter } from '../ui/card';

export function FileCard({
  file,
  onPressDelete,
}: {
  file: { key: string; name: string; url: string };
  onPressDelete: (key: string) => void;
}) {
  const isImage = /(png|jpe?g|gif|webp|avif)$/i.test(file.name);
  const isPdf = /\.pdf$/i.test(file.name);

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 w-28 h-28 sm:w-32 sm:h-32 flex flex-col border-border py-0">
      <div className="relative flex-1 w-full overflow-hidden bg-muted/20">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onPressDelete(file.key);
          }}
          variant="destructive"
          size="icon"
          className="absolute top-1 left-1 z-10 size-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-sm"
          title="حذف الملف"
        >
          <X className="size-3" />
        </Button>

        {isImage ? (
          <div className="relative w-full h-full">
            <img src={file.url} alt={file.name} className="h-full w-full" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-muted/30">
            {isPdf ? (
              <FileText className="size-8" />
            ) : (
              <FileText className="size-8" />
            )}
          </div>
        )}
      </div>

      <div className="border-t bg-card h-2 py-3 px-1 flex items-center justify-between gap-2 shrink-0">
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
