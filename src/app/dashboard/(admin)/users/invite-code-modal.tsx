'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2Icon, CheckIcon, CopyIcon } from 'lucide-react';

interface InviteCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteCode: string;
  userName: string;
}

export function InviteCodeModal({
  open,
  onOpenChange,
  inviteCode,
  userName,
}: InviteCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${inviteCode}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-primary">
            <CheckCircle2Icon className="inline-block ml-2 h-6 w-6 " />
            تم الإنشاء بنجاح!{' '}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            تم إنشاء حساب{' '}
            <span className="font-semibold text-foreground">{userName}</span>{' '}
            بنجاح
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info Text */}
          <div className="rounded-lg bg-foreground/20 p-3 text-sm text-foreground border border-accent-muted/20">
            <p>
              شاركي رابط الدعوة مع {userName} حتى يتمكن من إكمال التسجيل والدخول
              إلى نبراس.
            </p>
            <p className="text-xs font-bold mt-4 text-center">
              ⏰ صلاحية الرابط: 7 أيام
            </p>
          </div>

          {/* Copy Button */}
          <Button
            variant="primary"
            onClick={handleCopy}
            className="w-full space-x-1"
          >
            <span>
              {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
            </span>
            <span>{copied ? 'تم النسخ' : 'نسخ رابط الدعوة'}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
