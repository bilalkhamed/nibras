'use client';

import { useCallback, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/shared/utils';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';
import { set } from 'zod';

export function FileUploader() {
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
      toast.success(`تم حذف الملف ${fileToRemove.file.name} بنجاح.`);
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
            toast.success(`تم رفع الملف ${file.name} بنجاح.`);
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

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
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
        toast.error('يمكنك رفع ملف واحد فقط.');
      }

      if (invalidFileType) {
        toast.error(
          'لا يكنك رفع هذا النوع من الملفات. الملفات المسموحة: الصور، وال PDF.'
        );
      }

      if (fileTooLarge) {
        toast.error(
          'الملف الذي تحاول رفعه أكبر من الحجم المسموح به (5 ميجابايت).'
        );
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 1,
    maxSize: 1024 * 1024 * 5, // 5 MB
    accept: {
      'image/*': [],
      'application/pdf': [],
    },
  });

  return (
    <div className="w-full flex flex-col">
      <Card
        className={cn(
          'relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64',
          isDragActive
            ? 'border-accent bg-accent/10 border-solid'
            : 'border-border hover:border-accent'
        )}
        {...getRootProps()}
      >
        <CardContent className="flex flex-col items-center justify-center h-full w-full">
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-center text-gray-500">Drop the files here ...</p>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full gap-y-3">
              <p className="text-center text-gray-500">
                Drag 'n' drop some files here, or click to select files
              </p>
              <Button variant="outline">Select Files</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mt-6">
        {files.map((file) => (
          <Card
            key={file.id}
            className={cn(
              'relative overflow-hidden transition-all duration-200',
              file.error
                ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950'
                : file.uploading
                  ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950'
                  : file.progress === 100
                    ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950'
                    : 'border-border hover:border-accent'
            )}
          >
            {/* Delete Button */}
            <Button
              onClick={() => deleteFile(file.id)}
              disabled={file.uploading || file.isDeleting}
              variant={'destructive'}
              size={'icon'}
              className="absolute top-2 left-2 z-3"
              title="حذف الملف"
            >
              {file.isDeleting ? (
                <Loader2 className="size-4 text-white animate-spin" />
              ) : (
                <Trash2 className="size-4 text-white" />
              )}
            </Button>

            <CardContent className="p-0">
              {/* Image Preview */}
              {file.file.type.startsWith('image/') && file.objectURL ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={file.objectURL}
                    alt={file.file.name}
                    className="w-full h-32 object-cover"
                  />
                  {/* Overlay with state indicators */}
                  {(file.uploading || file.error || file.progress < 100) && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                      {file.uploading && (
                        <>
                          <div className="size-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-xs font-medium text-white">
                            {file.progress}%
                          </span>
                        </>
                      )}
                      {file.error && (
                        <>
                          <span className="text-2xl">⚠️</span>
                          <span className="text-xs font-medium text-white text-center px-1">
                            خطأ
                          </span>
                        </>
                      )}
                      {!file.uploading &&
                        !file.error &&
                        file.progress === 100 && (
                          <>
                            <span className="text-2xl">✓</span>
                            <span className="text-xs font-medium text-white">
                              تم
                            </span>
                          </>
                        )}
                    </div>
                  )}
                  {/* Progress bar */}
                  {file.uploading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-200">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : file.file.type === 'application/pdf' ? (
                /* PDF Preview */
                <div
                  className={cn(
                    'w-full h-32 flex flex-col items-center justify-center rounded relative',
                    file.error
                      ? 'bg-red-100 dark:bg-red-900'
                      : file.uploading
                        ? 'bg-blue-100 dark:bg-blue-900'
                        : file.progress === 100
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  <span className="text-3xl">📄</span>

                  {/* Overlay with state indicators */}
                  {(file.uploading || file.error || file.progress < 100) && (
                    <div className="absolute inset-0 bg-black/40 rounded flex flex-col items-center justify-center gap-1">
                      {file.uploading && (
                        <>
                          <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span className="text-xs font-medium text-white">
                            {file.progress}%
                          </span>
                        </>
                      )}
                      {file.error && (
                        <>
                          <span className="text-xl">⚠️</span>
                          <span className="text-xs font-medium text-white">
                            خطأ
                          </span>
                        </>
                      )}
                      {!file.uploading &&
                        !file.error &&
                        file.progress === 100 && (
                          <>
                            <span className="text-xl">✓</span>
                            <span className="text-xs font-medium text-white">
                              تم
                            </span>
                          </>
                        )}
                    </div>
                  )}
                </div>
              ) : null}

              {/* File name */}
              <div className="p-2 border-t bg-white dark:bg-slate-950">
                <p className="text-xs font-medium truncate text-foreground">
                  {file.file.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
