'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2Icon,
  CheckIcon,
  CopyIcon,
  Loader2Icon,
} from 'lucide-react';

interface InviteRegenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    firstName: string;
  };
}

export function InviteRegenModal({
  open,
  onOpenChange,
  user,
}: InviteRegenModalProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${inviteCode}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    if (!open || !user.id) return;
    const fetchInviteCode = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${user.id}/invite`, {
          method: 'POST',
        });

        const data = await res.json();
        if (!res.ok) {
          setError('حدث خطأ أثناء إنشاء رمز الدعوة.');
          setLoading(false);
          return;
        }

        setInviteCode(data.inviteCode);
        setLoading(false);
        setError(null);
      } catch {
        setError('حدث خطأ أثناء إنشاء رمز الدعوة.');
        setLoading(false);
      }
    };

    fetchInviteCode();
  }, [user.id, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-75">
        {loading ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-primary">
                جاري إنشاء رمز الدعوة... يرجى الانتظار
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center h-40">
              <Loader2Icon className="animate-spin h-8 w-8 text-primary" />
            </div>
          </>
        ) : error ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-red-500">
                حدث خطأ أثناء إنشاء رمز الدعوة
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-red-600 mb-4">حدث خطأ: {error}</p>
              <Button variant="destructive" onClick={() => onOpenChange(false)}>
                إغلاق
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-primary">
                <CheckCircle2Icon className="inline-block ml-2 h-6 w-6 " />
                تم إنشاء رمز الدعوة بنجاح!{' '}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Info Text */}
              <div className="rounded-lg bg-foreground/20 p-3 text-sm text-foreground border border-accent-muted/20">
                <p>
                  شاركي رابط الدعوة مع {user.firstName} حتى تتمكن من إكمال
                  التسجيل والدخول إلى نبراس.
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
