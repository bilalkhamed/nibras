/**
 * SubmissionViewerSheet Component
 *
 * Read-only sheet to view student submission details for supervisors/admins.
 * Displays text submissions, uploaded files, and allows adding comments/scores (UI only).
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
import { X } from 'lucide-react';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toArabicNumerals } from '@/lib/shared/utils';
import { FileCard } from '@/components/common/file-card';

type SubmissionViewerSheetProps = {
  /** Student name */
  studentName: string;
  /** Assignment name */
  assignmentName: string;
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
  /** Trigger button element */
  children: React.ReactNode;
};

/**
 * Sheet for viewing student submission (read-only)
 */
export function SubmissionViewerSheet({
  studentName,
  assignmentName,
  textSubmission,
  fileKey,
  fileUrl,
  allowTextSubmission,
  allowFileSubmission,
  children,
}: SubmissionViewerSheetProps) {
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [score, setScore] = useState('');

  const hasTextSubmission = textSubmission && textSubmission.trim().length > 0;
  const hasFileSubmission = fileKey && fileUrl;
  const hasSubmission = hasTextSubmission || hasFileSubmission;

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

            {/* Comment Section (UI only - non-functional) */}
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-right">
                التقييم والملاحظات
              </h3>

              <div className="space-y-2">
                <Label htmlFor="score" className="text-right">
                  الدرجة (اختياري)
                </Label>
                <Input
                  id="score"
                  type="number"
                  placeholder="أدخلي الدرجة"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="text-right"
                  dir="rtl"
                  min={0}
                  max={100}
                />
                <p className="text-xs text-muted-foreground text-right">
                  غير فعّال حاليًا - للعرض فقط
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment" className="text-right">
                  ملاحظات (اختياري)
                </Label>
                <Textarea
                  id="comment"
                  placeholder="اكتبي ملاحظاتك هنا..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-25 resize-none text-right"
                  dir="rtl"
                />
                <p className="text-xs text-muted-foreground text-right">
                  غير فعّال حاليًا - للعرض فقط
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="gap-2 px-3 py-3 shrink-0 border-t">
          <SheetClose asChild>
            <Button type="button" variant="outline" className="w-full">
              <X className="h-4 w-4 ml-2" />
              إغلاق
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
