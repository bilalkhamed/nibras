'use client';

import type { GroupSupervisorDTO } from '../../types';

type Props = {
  supervisors: GroupSupervisorDTO[];
};

export function SupervisorSection({ supervisors }: Props) {
  return (
    <section className="rounded-2xl border border-primary/15 bg-card p-6 shadow-sm dark:border-primary/25 dark:bg-[#15101f]">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <span className="text-2xl">👩‍🏫</span>
        {`المشرفات (${supervisors.length})`}
      </h2>

      <div className="mt-4 space-y-4">
        {supervisors.map((supervisor) => {
          const fullName = `${supervisor.firstName} ${
            supervisor.middleName || ''
          } ${supervisor.lastName}`.trim();

          return (
            <div
              key={supervisor.id}
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/60 bg-card/60 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-primary to-secondary text-2xl font-bold text-white shadow-md">
                  {supervisor.firstName[0]}
                </div>

                <div>
                  <p className="text-lg font-bold text-foreground">
                    {fullName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {supervisor.email || '—'}
                  </p>
                  {supervisor.phone && (
                    <p className="text-sm text-muted-foreground">
                      {supervisor.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
