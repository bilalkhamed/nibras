'use client';

import * as React from 'react';
import { WeekManagerProvider } from './week-manager-context';
import { WeekTimeline } from './week-timeline';
import { WeekManagerToolbar } from './week-manager-toolbar';
import { SaveChangesButton } from './save-changes-button';
import { CalendarWeekItem } from './types';

interface WeekManagerProps {
  initialWeeks: CalendarWeekItem[];
}

export function WeekManager({ initialWeeks }: WeekManagerProps) {
  return (
    <WeekManagerProvider initialWeeks={initialWeeks}>
      <div className="flex flex-col gap-6 ">
        {/* Header */}

        <WeekManagerToolbar />

        {/* Timeline */}
        <WeekTimeline />

        {/* Floating save button */}
        <SaveChangesButton />
      </div>
    </WeekManagerProvider>
  );
}
