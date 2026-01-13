import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/shared/utils';
import { AttachedFile, UploadingFile } from './file-uploader';
import {
  FileTextIcon,
  Trash2Icon,
  CheckCircle2Icon,
  Loader2Icon,
  XCircleIcon,
} from 'lucide-react';

export type FileCardItem = AttachedFile | UploadingFile;

function isUploadingFile(file: FileCardItem): file is UploadingFile {
  return 'file' in file;
}

function getDisplayKey(file: FileCardItem) {
  return file.key ?? (isUploadingFile(file) ? file.id : file.name);
}

function getFileNameFromKey(key: string | null | undefined) {
  if (!key) return 'ملف غير معروف';

  const SEPARATOR = '__uuid_end__';
  if (key.includes(SEPARATOR)) {
    return key.split(SEPARATOR)[1];
  }
  return key;
}

function getDisplayName(file: FileCardItem) {
  if (isUploadingFile(file)) {
    return file.file.name;
  }
  return getFileNameFromKey(file.key);
}

function getPreviewUrl(file: FileCardItem) {
  if (isUploadingFile(file)) return file.objectURL;
  return file.tempUrl;
}

export function FilesCardsList({
  files,
  onFileDelete,
}: {
  files: FileCardItem[];
  onFileDelete: (fileKey: string) => void;
}) {
  if (files.length === 0) return null;

  return (
    <div className="py-3 px-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 text-right">
        الملفات {isUploadingFile(files[0]) ? 'الجديدة' : 'المرفقة'} (
        {files.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {files.map((file) => {
          const key = getDisplayKey(file);
          const name = getDisplayName(file);
          const previewUrl = getPreviewUrl(file);
          const isUploading = isUploadingFile(file) && file.uploading;
          const hasError = isUploadingFile(file) && file.error;
          const isCompleted =
            isUploadingFile(file) &&
            !file.uploading &&
            !file.error &&
            file.progress === 100;
          const isPdf = name.toLowerCase().endsWith('.pdf');

          return (
            <div
              key={key}
              className={cn(
                'group relative border rounded-xl overflow-hidden transition-all duration-200',
                'hover:shadow-md hover:border-primary/50',
                hasError && 'border-destructive bg-destructive/5',
                isCompleted && 'border-green-200 bg-green-50/50',
                !hasError && !isCompleted && 'border-border bg-card'
              )}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute top-2 left-2 z-10 h-7 w-7 rounded-full',
                  'bg-background/80 backdrop-blur-sm shadow-sm',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  'hover:bg-destructive hover:text-destructive-foreground'
                )}
                onClick={() => onFileDelete(String(file.key ?? key))}
              >
                <Trash2Icon className="h-3.5 w-3.5" />
              </Button>

              <div className="w-full aspect-video bg-muted/50 flex items-center justify-center relative overflow-hidden">
                {isPdf ? (
                  <FileTextIcon className="h-14 w-14 text-primary" />
                ) : previewUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl}
                    alt={name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    لا يوجد معاينة
                  </span>
                )}
              </div>

              <div className="p-3 space-y-2">
                <div
                  className="text-sm font-medium text-foreground truncate"
                  title={name}
                >
                  {name}
                </div>

                {isUploadingFile(file) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={file.progress}
                        className={cn(
                          'h-2 flex-1',
                          hasError && '[&>div]:bg-destructive',
                          isCompleted && '[&>div]:bg-green-600',
                          isUploading && '[&>div]:bg-blue-500'
                        )}
                      />
                      {hasError ? (
                        <XCircleIcon className="h-4 w-4 text-destructive shrink-0" />
                      ) : file.uploading ? (
                        <Loader2Icon className="h-4 w-4 text-blue-500 shrink-0 animate-spin" />
                      ) : (
                        <CheckCircle2Icon className="h-4 w-4 text-green-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium tabular-nums text-muted-foreground">
                        {Math.round(file.progress)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
