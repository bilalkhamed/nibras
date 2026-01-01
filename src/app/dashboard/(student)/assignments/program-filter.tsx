'use client';

import { Button } from '@/components/ui/button';

type Program = { id: string; name: string };

type Props = {
  programs: Program[];
  programFilter: string;
  onFilterChange?: (id: string) => void;
};

export function ProgramFilter({
  programs,
  programFilter,
  onFilterChange,
}: Props) {
  return (
    <div className="rounded-2xl border border-primary/15 bg-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-foreground">
        اختاري البرنامج
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={programFilter === 'all' ? 'primary' : 'outline'}
          onClick={() => onFilterChange && onFilterChange('all')}
        >
          الكل
        </Button>
        {programs.map((program) => (
          <Button
            key={program.id}
            size="sm"
            variant={programFilter === program.id ? 'primary' : 'outline'}
            onClick={() => onFilterChange && onFilterChange(program.id)}
          >
            {program.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
