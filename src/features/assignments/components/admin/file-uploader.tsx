/**
 * FileUploader Component
 *
 * Handles file uploads to S3 with drag-and-drop support.
 * Shows upload progress and allows deletion of uploaded files.
 */

'use client';

import { FileRejection, useDropzone } from 'react-dropzone';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/shared/utils';
import { UploadCloudIcon } from 'lucide-react';
import { FilesCardsList } from './files-cards-list';
import type { UploadingFile } from '../../types';

// Re-export types for consumers
export type { AttachedFile, UploadingFile } from '../../types';

type FileUploaderProps = {
  /** Maximum file size in bytes (default: 10MB) */
  maxSize?: number;
  /** Maximum number of files (default: 3) */
  maxFiles?: number;
  /** Use compact layout (default: true) */
  compact?: boolean;
  /** Callback when a file is successfully uploaded */
  onFileUpload: (fileKey: string) => void;
  /** Callback when a file is deleted */
  onFileDelete: (fileKey: string) => void;
};

/**
 * File uploader with drag-and-drop and S3 integration
 */
export function FileUploader({
  maxSize = 10 * 1024 * 1024,
  maxFiles = 3,
  compact = true,
  onFileUpload,
  onFileDelete,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);

  // Revoke object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.objectURL) {
          URL.revokeObjectURL(file.objectURL);
        }
      });
    };
  }, [files]);

  /**
   * Delete a file from S3 and local state
   */
  async function deleteFile(fileKey: string) {
    try {
      const fileToRemove = files.find((f) => f.key === fileKey);
      if (!fileToRemove) return;

      if (fileToRemove.objectURL) {
        URL.revokeObjectURL(fileToRemove.objectURL);
      }

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.key === fileKey ? { ...f, isDeleting: true } : f,
        ),
      );

      onFileDelete(fileKey);

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
            f.key === fileKey ? { ...f, isDeleting: false } : f,
          ),
        );
        return;
      }

      setFiles((prevFiles) => prevFiles.filter((f) => f.key !== fileKey));
    } catch {
      toast.error('حدث خطأ أثناء حذف الملف.');

      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.key === fileKey ? { ...f, isDeleting: false, error: true } : f,
        ),
      );
    }
  }

  /**
   * Handle dropped files
   */
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      /**
       * Upload a single file to S3
       */
      async function uploadFile(file: File) {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.file === file ? { ...f, uploading: true } : f,
          ),
        );

        try {
          // Get presigned URL from our API
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
                  : f,
              ),
            );
            return;
          }

          const { presignedUrl, key } = await response.json();

          // Upload directly to S3 with progress tracking
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percentCompleted = (event.loaded / event.total) * 100;
                setFiles((prevFiles) =>
                  prevFiles.map((f) =>
                    f.file === file
                      ? { ...f, progress: Math.round(percentCompleted), key }
                      : f,
                  ),
                );
              }
            };

            xhr.onload = () => {
              if (xhr.status === 200 || xhr.status === 204) {
                setFiles((prevFiles) =>
                  prevFiles.map((f) =>
                    f.file === file
                      ? { ...f, uploading: false, progress: 100, error: false }
                      : f,
                  ),
                );
                // Notify parent of successful upload
                onFileUpload(key);
                resolve();
              } else {
                reject(
                  new Error(
                    `حدث خطأ أثناء رفع الملف. رمز الخطأ: ${xhr.status}`,
                  ),
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
        } catch {
          toast.error(`حدث خطأ أثناء رفع الملف ${file.name}.`);
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.file === file
                ? { ...f, uploading: false, progress: 0, error: true }
                : f,
            ),
          );
        }
      }

      if (acceptedFiles.length === 0) return;

      // Add files to state with initial values
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

      // Start uploading each file
      acceptedFiles.forEach((file) => {
        uploadFile(file);
      });
    },
    [onFileUpload],
  );

  /**
   * Handle rejected files (too large, wrong type, etc.)
   */
  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const tooManyFiles = fileRejections.find(
          (rejection) => rejection.errors[0].code === 'too-many-files',
        );
        const fileTooLarge = fileRejections.find(
          (rejection) => rejection.errors[0].code === 'file-too-large',
        );
        const invalidFileType = fileRejections.find(
          (rejection) => rejection.errors[0].code === 'file-invalid-type',
        );

        if (tooManyFiles) {
          toast.error(`يمكنك رفع ${maxFiles} ملفات كحد أقصى.`);
        }

        if (invalidFileType) {
          toast.error(
            'لا يكنك رفع هذا النوع من الملفات. الملفات المسموحة: الصور، وال PDF.',
          );
        }

        if (fileTooLarge) {
          const maxSizeMB = maxSize / (1024 * 1024);
          toast.error(
            `الملف الذي تحاول رفعه أكبر من الحجم المسموح به (${maxSizeMB} ميجابايت).`,
          );
        }
      }
    },
    [maxFiles, maxSize],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles,
    maxSize: maxSize,
    accept: {
      'image/*': [],
      'application/pdf': [],
    },
  });

  return (
    <>
      <Card
        className={cn(
          'relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full overflow-hidden',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          compact ? 'h-32' : 'h-64',
        )}
        {...getRootProps()}
      >
        <CardContent className="flex flex-col items-center justify-center h-full w-full p-0">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
            <div
              className={cn(
                'rounded-full bg-background p-2 border shadow-sm',
                compact ? 'size-8' : 'size-12',
              )}
            >
              <UploadCloudIcon
                className={cn(
                  'text-muted-foreground',
                  compact ? 'size-4' : 'size-6',
                )}
              />
            </div>
            <div className="space-y-1">
              <p
                className={cn(
                  'font-medium text-foreground',
                  compact ? 'text-sm' : 'text-base',
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
      <FilesCardsList files={files} onFileDelete={deleteFile} />
    </>
  );
}
