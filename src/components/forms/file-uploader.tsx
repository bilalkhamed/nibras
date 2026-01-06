'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/shared/utils';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
  Trash2,
  Loader2,
  FileText,
  UploadCloud,
  X,
  Image as ImageIcon,
} from 'lucide-react';

interface FileUploaderProps {
  compact?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onFileUpload?: (key: string) => void;
  onFilesChange?: (keys: string[]) => void;
}

export function FileUploader({
  compact = false,
  maxSize = 1024 * 1024 * 5, // 5 MB
  maxFiles = 3,
  onFileUpload,
  onFilesChange,
}: FileUploaderProps) {
  const [files, setFiles] = useState<
    {
      id: string;
      file: File;
      uploading: boolean;
      progress: number;
      key?: string;
      isDeleting: boolean;
      error: boolean;
      objectURL?: string;
    }[]
  >([]);

  // Use a ref for the callback to prevent infinite loops when the parent passes an inline function
  // and this component calls it, causing a re-render of the parent, creating a new function, etc.
  const onFilesChangeRef = useRef(onFilesChange);

  useEffect(() => {
    onFilesChangeRef.current = onFilesChange;
  }, [onFilesChange]);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.objectURL) {
          URL.revokeObjectURL(file.objectURL);
        }
      });
    };
  }, [files]);

  useEffect(() => {
    if (onFilesChangeRef.current) {
      const keys = files
        .filter((f) => f.key && !f.uploading && !f.error && !f.isDeleting)
        .map((f) => f.key as string);

      onFilesChangeRef.current(keys);
    }
    // Intentionally omitting onFilesChangeRef from dependencies to avoid loop from parent re-renders
  }, [files]);

  async function deleteFile(fileId: string) {
    try {
      const fileToRemove = files.find((f) => f.id === fileId);
      if (!fileToRemove) return;

      if (fileToRemove.objectURL) {
        URL.revokeObjectURL(fileToRemove.objectURL);
      }

      setFiles((prevFiles) =>
        prevFiles.map((f) => (f.id === fileId ? { ...f, isDeleting: true } : f))
      );

      const response = await fetch('/api/s3/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: fileToRemove.key,
        }),
      });

      if (!response.ok) {
        toast.error('فشل في حذف الملف من الخادم.');
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileId ? { ...f, isDeleting: false } : f
          )
        );
        return;
      }

      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== fileId));
      toast.info(`تم حذف الملف ${fileToRemove.file.name}.`);
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف الملف.');

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === fileId ? { ...f, isDeleting: false, error: true } : f
        )
      );
    }
  }

  async function uploadFile(file: File) {
    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.file === file ? { ...f, uploading: true } : f))
    );

    try {
      const response = await fetch('/api/s3/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!response.ok) {
        toast.error('فشل في الحصول على رابط الرفع المسبق.');
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file === file
              ? { ...f, uploading: false, progress: 0, error: true }
              : f
          )
        );
        return;
      }

      const { presignedUrl, key } = await response.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentCompleted = (event.loaded / event.total) * 100;
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.file === file
                  ? { ...f, progress: Math.round(percentCompleted), key }
                  : f
              )
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 204) {
            setFiles((prevFiles) =>
              prevFiles.map((f) =>
                f.file === file
                  ? { ...f, uploading: false, progress: 100, error: false }
                  : f
              )
            );
            // Call onFileUpload passed prop with the key
            if (onFileUpload) {
              onFileUpload(key);
            }
            resolve();
          } else {
            reject(
              new Error(`حدث خطأ أثناء رفع الملف. رمز الخطأ: ${xhr.status}`)
            );
          }
        };

        xhr.onerror = () => {
          reject(new Error('حدث خطأ في الشبكة أثناء رفع الملف.'));
        };

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (error) {
      toast.error(`حدث خطأ أثناء رفع الملف ${file.name}.`);
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.file === file
            ? { ...f, uploading: false, progress: 0, error: true }
            : f
        )
      );
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length < 0) return;

    setFiles((prevFiles) => [
      ...prevFiles,
      ...acceptedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
        uploading: false,
        progress: 0,
        isDeleting: false,
        error: false,
        objectURL: URL.createObjectURL(file),
      })),
    ]);

    acceptedFiles.forEach(uploadFile);
  }, []);

  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const tooManyFiles = fileRejections.find(
          (rejection) => rejection.errors[0].code === 'too-many-files'
        );
        const fileTooLarge = fileRejections.find(
          (rejection) => rejection.errors[0].code === 'file-too-large'
        );
        const invalidFileType = fileRejections.find(
          (rejection) => rejection.errors[0].code === 'file-invalid-type'
        );

        if (tooManyFiles) {
          toast.error(`يمكنك رفع ${maxFiles} ملفات كحد أقصى.`);
        }

        if (invalidFileType) {
          toast.error(
            'لا يكنك رفع هذا النوع من الملفات. الملفات المسموحة: الصور، وال PDF.'
          );
        }

        if (fileTooLarge) {
          const maxSizeMB = maxSize / (1024 * 1024);
          toast.error(
            `الملف الذي تحاول رفعه أكبر من الحجم المسموح به (${maxSizeMB} ميجابايت).`
          );
        }
      }
    },
    [maxFiles, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles,
    maxSize, // Use prop
    accept: {
      'image/*': [],
      'application/pdf': [],
    },
  });

  return (
    <div className="w-full flex flex-col gap-4">
      <Card
        className={cn(
          'relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full overflow-hidden',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          compact ? 'h-32' : 'h-64'
        )}
        {...getRootProps()}
      >
        <CardContent className="flex flex-col items-center justify-center h-full w-full p-0">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
            <div
              className={cn(
                'rounded-full bg-background p-2 border shadow-sm',
                compact ? 'size-8' : 'size-12'
              )}
            >
              <UploadCloud
                className={cn(
                  'text-muted-foreground',
                  compact ? 'size-4' : 'size-6'
                )}
              />
            </div>
            <div className="space-y-1">
              <p
                className={cn(
                  'font-medium text-foreground',
                  compact ? 'text-sm' : 'text-base'
                )}
              >
                {isDragActive
                  ? 'أفلت الملفات هنا'
                  : 'اضغط للرفع أو اسحب الملفات'}
              </p>
              {!compact && (
                <p className="text-xs text-muted-foreground">
                  الحد الأقصى {maxFiles} ملفات (حتى {maxSize / (1024 * 1024)}{' '}
                  ميجابايت)
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <div
          className={cn(
            'grid gap-4',
            compact
              ? 'grid-cols-2'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
          )}
        >
          {files.map((file) => (
            <Card
              key={file.id}
              className={cn(
                'group relative overflow-hidden transition-all duration-200 aspect-square flex flex-col',
                file.error ? 'border-destructive' : 'border-border'
              )}
            >
              <div className="relative flex-1 w-full overflow-hidden bg-muted/20">
                {/* Delete Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  disabled={file.uploading || file.isDeleting}
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 left-1 z-10 size-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-sm"
                  title="حذف الملف"
                >
                  {file.isDeleting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <X className="size-3" />
                  )}
                </Button>

                {/* Preview */}
                {file.file.type.startsWith('image/') && file.objectURL ? (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.objectURL}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-muted/30">
                    {file.file.type === 'application/pdf' ? (
                      <FileText className="size-10" />
                    ) : (
                      <FileText className="size-10" />
                    )}
                  </div>
                )}

                {/* Status Overlay */}
                {(file.uploading || file.error) && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                    {file.uploading && (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="size-8 text-primary animate-spin" />
                        <span className="text-xs font-medium text-primary bg-background/80 px-2 py-0.5 rounded-full">
                          {file.progress}%
                        </span>
                      </div>
                    )}
                    {file.error && (
                      <div className="flex flex-col items-center gap-2">
                        <X className="size-8 text-destructive" />
                        <span className="text-xs font-medium text-destructive bg-background/80 px-2 py-0.5 rounded-full">
                          فشل
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Bar (Bottom of preview) */}
                {file.uploading && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300 ease-out"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* File Name Footer */}
              <div className="border-t bg-card h-10 px-2 flex items-center justify-between gap-2 shrink-0">
                <span
                  className="text-xs font-medium truncate max-w-full"
                  title={file.file.name}
                >
                  {file.file.name}
                </span>
                {/* Optional: Checkmark if done */}
                {!file.uploading && !file.error && file.progress === 100 && (
                  <div className="rounded-full bg-green-500/10 p-0.5 shrink-0">
                    <div className="size-1.5 rounded-full bg-green-500" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
