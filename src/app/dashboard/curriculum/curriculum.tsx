'use client';

import { useState, type ElementType } from 'react';
import labels from '@/lib/labels.json';
import { LevelTabs } from './components/level-tabs';
import { WeekNavigator } from './components/week-navigator';
import { CurriculumTable } from './components/curriculum-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Video, Heart } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { Separator } from '@/components/ui/separator';
import { AddItemDialog } from './add-item-dialogue';

type Program = {
  value: string;
  label: string;
  icon: ElementType;
};

const programs: Program[] = [
  {
    value: 'reading',
    label: labels.programs.reading.title,
    icon: BookOpen,
  },
  {
    value: 'lectures',
    label: labels.programs.lecture.title,
    icon: Video,
  },
  {
    value: 'heart',
    label: labels.programs.heart.title,
    icon: Heart,
  },
];

export default function Curriculum() {
  const [activeLevel, setActiveLevel] = useState(0);
  const [week, setWeek] = useState(1);
  const [activeProgram, setActiveProgram] = useState(programs[0].value);

  return (
    <section className="space-y-6 animate-in fade-in duration-300">
      <Tabs
        dir="rtl"
        value={activeProgram}
        onValueChange={(value) => {
          setActiveProgram(value);
          setActiveLevel(0);
          setWeek(1);
        }}
      >
        {/* Control card: programs + levels + week + add button */}
        <div className="overflow-x-auto md:overflow-x-visible scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <TabsList className="inline-flex md:flex md:w-full h-auto gap-2 rounded-xl bg-muted/60 p-1.5 border border-border backdrop-blur-sm min-w-fit md:min-w-0">
            {programs.map((program) => {
              const Icon = program.icon;
              const isActive = activeProgram === program.value;

              return (
                <TabsTrigger
                  key={program.value}
                  value={program.value}
                  className={cn(
                    'cursor-pointer',
                    'group relative inline-flex items-center gap-2 rounded-md px-4 py-2',
                    'text-sm font-medium transition-all duration-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    'data-[state=active]:text-primary',
                    'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground',
                    'data-[state=inactive]:hover:bg-background/60'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-all duration-300 group-hover:scale-110',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span className="truncate">{program.label}</span>
                  <span
                    className={cn(
                      'absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary transition-all duration-300',
                      isActive
                        ? 'scale-x-100 opacity-100'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-60 group-hover:opacity-60'
                    )}
                  />
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        <div className="rounded-xl border border-border bg-card/60 px-4 py-4 backdrop-blur-sm space-y-4">
          {/* Levels + week + add button */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-3 md:justify-between">
            <LevelTabs
              activeIndex={activeLevel}
              onChange={(i) => {
                setActiveLevel(i);
                setWeek(1);
              }}
            />

            <Separator className="md:hidden" />

            <div className="flex items-center gap-3">
              <WeekNavigator week={week} onChange={setWeek} />
              <AddItemDialog
                program={activeProgram}
                level={activeLevel}
                week={week}
              />
            </div>
          </div>
        </div>

        {/* Per-program content (table) */}
        {programs.map((program) => (
          <TabsContent
            key={program.value}
            value={program.value}
            className="space-y-4 pt-2"
          >
            <CurriculumTable items={[]} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
