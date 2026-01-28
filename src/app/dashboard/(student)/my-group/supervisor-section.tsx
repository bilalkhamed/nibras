'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle, Mail } from 'lucide-react';
import type { GroupSupervisorDTO } from '@/features/groups';

type Props = {
  supervisor: GroupSupervisorDTO;
};

export function SupervisorSection({ supervisor }: Props) {
  const fullName =
    `${supervisor.firstName} ${supervisor.middleName || ''} ${supervisor.lastName}`.trim();

  return (
    <section className="rounded-2xl border border-primary/15 bg-card p-6 shadow-sm dark:border-primary/25 dark:bg-[#15101f]">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <span className="text-2xl">👩‍🏫</span>
        المشرفة
      </h2>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-2xl font-bold text-white shadow-md">
            {supervisor.firstName[0]}
          </div>

          <div>
            <p className="text-lg font-bold text-foreground">{fullName}</p>
            <p className="text-sm text-muted-foreground">{supervisor.email}</p>
            {supervisor.phone && (
              <p className="text-sm text-muted-foreground">
                {supervisor.phone}
              </p>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={'primary'}
            className="flex items-center gap-2  text-white"
            onClick={() => alert('ميزة المراسلة قريباً!')}
          >
            <MessageCircle className="h-4 w-4" />
            راسلي المشرفة
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => {
              if (supervisor.email) {
                window.location.href = `mailto:${supervisor.email}`;
              }
            }}
          >
            <Mail className="h-4 w-4" />
            إرسال بريد
          </Button>
        </div>
      </div>

      {/* Encouragement */}
      <div className="mt-4 rounded-xl border border-secondary/20 bg-secondary-soft/30 p-3 text-center dark:bg-[#1b1524]/50">
        <p className="text-xs text-muted-foreground">
          💬 المشرفة موجودة دائماً لدعمك ومساعدتك!
        </p>
      </div>
    </section>
  );
}
