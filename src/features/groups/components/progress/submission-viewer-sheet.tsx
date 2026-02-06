/**
 * SubmissionViewerSheet Component
 *
 * Sheet to view student submission details and add grading (score + comment).
 * Displays text submissions, uploaded files, and allows grading.
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
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toArabicNumerals } from '@/lib/shared/utils';
import { FileCard } from '@/components/common/file-card';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { addGradeAction } from '@/features/assignments/actions';

type SubmissionViewerSheetProps = {
  /** Student name */
  studentName: string;
  /** Student ID */
  studentId: string;
  /** Assignment name */
  assignmentName: string;
  /** Assignment ID */
  assignmentId: string;
  /** Student text submission */
  textSubmission?: string | null;
  /** Uploaded file key */
  fileKey?: string | null;
  /** Presigned URL for the uploaded file */
  fileUrl?: string | null;
  /** Whether assignment allows text submission */
  allowTextSubmission: boolean;
  /** Whether assignment allows file submission */
  allowFileSubmission: boolean;
  /** Current score from database */
  currentScore?: number | null;
  /** Current comment from database */
  currentComment?: string | null;
  /** Trigger button element */
  children: React.ReactNode;
};

type GradeFormData = {
  score: string;
  comment: string;
};

/**
 * Sheet for viewing student submission and grading
 */
export function SubmissionViewerSheet({
  studentName,
  studentId,
  assignmentName,
  assignmentId,
  textSubmission,
  fileKey,
  fileUrl,
  allowTextSubmission,
  allowFileSubmission,
  currentScore,
  currentComment,
  children,
}: SubmissionViewerSheetProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { isDirty },
    reset,
  } = useForm<GradeFormData>({
    defaultValues: {
      score: currentScore?.toString() ?? '',
      comment: currentComment ?? '',
    },
  });

  const score = watch('score');
  const comment = watch('comment');

  const hasTextSubmission = textSubmission && textSubmission.trim().length > 0;
  const hasFileSubmission = fileKey && fileUrl;
  const hasSubmission = hasTextSubmission || hasFileSubmission;

  const isScoreMissing = !score || score.trim() === '';
  const canSave = isDirty && !isScoreMissing;

  const onSubmit = async (data: GradeFormData) => {
    setIsSaving(true);
    try {
      const result = await addGradeAction({
        assignmentId,
        studentId,
        data: {
          grade: parseInt(data.score, 10),
          comment: data.comment || undefined,
        },
      });

      if (result.success) {
        toast.success('تم حفظ التقييم بنجاح');
        reset(data);
        setOpen(false);
      } else {
        toast.error('فشل حفظ التقييم');
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      toast.error('حدث خطأ أثناء حفظ التقييم');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="left"
        className="flex flex-col h-full w-full sm:max-w-lg"
      >
        <SheetDescription className="sr-only">
          عرض تسليم الطالبة للمهمة
        </SheetDescription>
        <SheetHeader className="px-3 pt-3 pb-2 shrink-0">
          <SheetTitle className="text-right">عرض التسليم</SheetTitle>
          <div className="text-sm text-muted-foreground text-right space-y-1">
            <p className="font-medium">{assignmentName}</p>
            <p className="text-xs">الطالبة: {studentName}</p>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0" dir="rtl">
          <div className="px-3 py-4 space-y-6">
            {!hasSubmission && (
              <div className="p-6 text-center rounded-lg border border-dashed border-muted-foreground/30">
                <p className="text-sm text-muted-foreground">
                  لم يتم تسليم هذه المهمة بعد
                </p>
              </div>
            )}

            {/* Text Submission Section */}
            {allowTextSubmission && (
              <div className="space-y-2">
                <Label className="text-right">الإجابة النصية</Label>
                {hasTextSubmission ? (
                  <div className="p-3 rounded-md bg-muted/50 border border-border min-h-30 text-right">
                    <p className="text-sm whitespace-pre-wrap">
                      {textSubmission}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {toArabicNumerals(textSubmission!.length)} حرف
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-md bg-muted/20 border border-dashed border-muted-foreground/30 min-h-30 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      لا يوجد نص مُسلّم
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Separator when both are enabled */}
            {allowTextSubmission && allowFileSubmission && (
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">و</span>
                <Separator className="flex-1" />
              </div>
            )}

            {/* File Submission Section */}
            {allowFileSubmission && (
              <div className="space-y-2">
                <Label className="text-right">الملف المرفق</Label>
                {hasFileSubmission ? (
                  <FileCard
                    file={{
                      key: fileKey || '',
                      name: fileKey?.split('__uuid_end__')[1] || 'ملف مرفق',
                      url: fileUrl!,
                    }}
                    onPressDelete={() => {
                      /* Read-only - do nothing */
                    }}
                  />
                ) : (
                  <div className="p-3 rounded-md bg-muted/20 border border-dashed border-muted-foreground/30 min-h-20 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      لا يوجد ملف مُرفق
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Comment Section */}
            <Separator />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="text-sm font-semibold text-right">
                التقييم والملاحظات
              </h3>

              <div className="space-y-2">
                <Label htmlFor="score" className="text-right">
                  الدرجة
                  <span className="text-destructive mr-1">*</span>
                </Label>
                <Input
                  id="score"
                  type="number"
                  placeholder="أدخلي الدرجة"
                  {...register('score', { required: true })}
                  className="text-right"
                  dir="rtl"
                  min={0}
                  max={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment" className="text-right">
                  ملاحظات (اختياري)
                </Label>
                <Textarea
                  id="comment"
                  placeholder="اكتبي ملاحظاتك هنا..."
                  {...register('comment')}
                  className="min-h-25 resize-none text-right"
                  dir="rtl"
                />
              </div>

              {/* Hidden submit for keyboard enter */}
              <button type="submit" className="sr-only" aria-hidden="true" />
            </form>
          </div>
        </ScrollArea>

        <SheetFooter className="gap-2 px-3 py-3 shrink-0 border-t grid grid-cols-2">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              <X className="h-4 w-4 ml-2" />
              إغلاق
            </Button>
          </SheetClose>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!canSave || isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ التقييم'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
