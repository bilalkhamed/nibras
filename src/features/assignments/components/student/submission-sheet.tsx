/**
 * SubmissionSheet Component
 *
 * Sheet dialog for students to submit assignments.
 * Supports text submissions, file uploads, or both based on assignment requirements.
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FileUploader } from '../admin/file-uploader';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { updateStudentAssignmentAction } from '../../actions';
import { toast } from 'sonner';
import { toArabicNumerals } from '@/lib/shared/utils';
import { FileCard } from '@/components/common/file-card';

type SubmissionSheetProps = {
  /** Assignment ID */
  assignmentId: string;
  /** Assignment name for display */
  assignmentName: string;
  /** Whether file submission is allowed */
  allowFileSubmission: boolean;
  /** Whether text submission is allowed */
  allowTextSubmission: boolean;

  defaultValues: {
    fileKey?: string | null;
    textSubmission?: string | null;
    fileUrl?: string | null;
  };
  /** Trigger button element */
  children: React.ReactNode;
};

/**
 * Sheet for submitting assignment text/files
 */
export function SubmissionSheet({
  assignmentId,
  assignmentName,
  allowFileSubmission,
  allowTextSubmission,
  defaultValues,
  children,
}: SubmissionSheetProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [textContent, setTextContent] = useState(
    defaultValues.textSubmission || '',
  );
  const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(
    defaultValues.fileKey || null,
  );

  // Reset state to defaultValues whenever the sheet opens
  useEffect(() => {
    if (open) {
      setTextContent(defaultValues.textSubmission || '');
      setUploadedFileKey(defaultValues.fileKey || null);
    }
  }, [open, defaultValues.textSubmission, defaultValues.fileKey]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const res = await updateStudentAssignmentAction({
        assignmentId,
        data: {
          isCompleted: true,
          textSubmission: allowTextSubmission ? textContent : null,
          fileKey: allowFileSubmission ? uploadedFileKey : null,
        },
      });

      if (!res.success) {
        throw new Error(`Submission failed: ${res.error}`);
      }

      toast.success('تم إرسال المهمة بنجاح!');
      setTextContent('');
      setUploadedFileKey(null);
      setOpen(false);
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('تعذر إرسال المهمة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(
    'Uploaded File Key:',
    uploadedFileKey,
    'Default File Key:',
    defaultValues.fileKey,
  );

  const canSubmit =
    (allowTextSubmission && textContent.trim()) ||
    (allowFileSubmission && uploadedFileKey !== null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col h-full w-full sm:max-w-lg"
      >
        <SheetDescription className="sr-only">
          {' '}
          تسليم نص أو ملف للمهمة{' '}
        </SheetDescription>
        <SheetHeader className="px-3 pt-3 pb-2 shrink-0">
          <SheetTitle className="text-right">تقديم المهمة</SheetTitle>
          <p className="text-sm text-muted-foreground text-right">
            {assignmentName}
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0" dir="rtl">
          <div className="px-3 py-4 space-y-6">
            {/* Text Submission Section */}
            {allowTextSubmission && (
              <div className="space-y-2">
                <Label htmlFor="text-submission" className="text-right">
                  إجابتك النصية
                  {!allowFileSubmission && (
                    <span className="text-destructive mr-1">*</span>
                  )}
                </Label>
                <Textarea
                  id="text-submission"
                  placeholder="اكتبي إجابتك هنا..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-50 resize-none text-right"
                  dir="rtl"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {toArabicNumerals(textContent.length)} حرف
                </p>
              </div>
            )}

            {/* Separator when both are enabled */}
            {allowTextSubmission && allowFileSubmission && (
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">أو</span>
                <Separator className="flex-1" />
              </div>
            )}

            {/* File Upload Section */}
            {allowFileSubmission && (
              <div className="space-y-2">
                <Label className="text-right">
                  رفع ملف
                  {!allowTextSubmission && (
                    <span className="text-destructive mr-1">*</span>
                  )}
                </Label>
                <FileUploader
                  maxFiles={
                    defaultValues.fileKey &&
                    defaultValues.fileKey === uploadedFileKey
                      ? 0
                      : 1
                  }
                  onFileUpload={(fileKey) => {
                    setUploadedFileKey(fileKey);
                  }}
                  onFileDelete={() => {
                    setUploadedFileKey(null);
                  }}
                />
              </div>
            )}
          </div>

          {defaultValues.fileUrl &&
            uploadedFileKey === defaultValues.fileKey && (
              <div className="max-w-70 px-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 text-right">
                  الملف المرفق سابقًا
                </h3>
                <FileCard
                  file={{
                    key: defaultValues.fileKey || '',
                    name:
                      defaultValues.fileKey?.split('__uuid_end__')[1] ||
                      'ملف المرفق',
                    url: defaultValues.fileUrl!,
                  }}
                  onPressDelete={() => setUploadedFileKey(null)}
                />
              </div>
            )}
        </ScrollArea>

        <SheetFooter className="gap-2 px-3 py-3 shrink-0 border-t flex flex-row">
          <SheetClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                setTextContent('');
                setUploadedFileKey(null);
              }}
            >
              إلغاء
            </Button>
          </SheetClose>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                إرسال
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
