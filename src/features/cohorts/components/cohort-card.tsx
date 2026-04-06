'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  BookOpen,
  UserCog,
  GraduationCap,
  Pencil,
  Trash2,
} from 'lucide-react';
import { CohortListDetailedDTO } from '../types';
import { EditCohortSheet } from './management/edit-cohort-sheet';
import { DeleteCohortDialog } from './management/delete-cohort-dialog';

type CohortCardProps = {
  cohort: CohortListDetailedDTO;
};

export function CohortCard({ cohort }: CohortCardProps) {
  return (
    <Card className="group relative border-primary/15 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <CardTitle className="text-lg font-bold text-foreground">
              {cohort.name}
            </CardTitle>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>{cohort.currentLevel.title}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <UserCog className="h-4 w-4" />
              <span>
                {cohort.managers.length > 0 &&
                  'مدير الدفعة: ' +
                    cohort.managers[0].user.firstName +
                    ' ' +
                    cohort.managers[0].user.middleName +
                    ' ' +
                    cohort.managers[0].user.lastName}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <EditCohortSheet cohort={cohort}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
            </EditCohortSheet>
            <DeleteCohortDialog cohortId={cohort.id} cohortName={cohort.name}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </DeleteCohortDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 border border-primary/15 p-3">
            <Users className="h-5 w-5 text-primary mb-1" />
            <span className="text-xs text-muted-foreground">اليافعات</span>
            <span className="text-lg font-bold text-primary">
              {cohort._count.students}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-secondary/5 border border-secondary/15 p-3">
            <BookOpen className="h-5 w-5 text-secondary-foreground mb-1" />
            <span className="text-xs text-muted-foreground">المجموعات</span>
            <span className="text-lg font-bold text-secondary-foreground">
              {cohort._count.groups}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-accent/10 border border-accent/30 p-3">
            <UserCog className="h-5 w-5 text-accent-foreground dark:text-accent mb-1" />
            <span className="text-xs text-muted-foreground">مديرة الدفعة</span>
            <span className="text-lg font-bold text-accent-foreground dark:text-accent">
              {cohort._count.managers}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
