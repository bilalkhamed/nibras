import React from 'react';

type Props = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

export function InfoField({ label, value, icon }: Props) {
  return (
    <div className="rounded-lg border border-border p-4 bg-card/60">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-foreground mt-1">{value}</div>
    </div>
  );
}
