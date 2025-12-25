'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { User, Edit, Archive, Trash2, ExternalLink } from 'lucide-react';
import { InfoField } from '@/components/info-field';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';
import { CohortLevels } from '@/types/types';
import labels from '@/lib/labels.json';

interface GroupInfoSectionProps {
  groupName: string;
  cohortId: string;
  studentCount: number;
  supervisor: {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  cohort: {
    id: string;
    name: string;
    currentLevel: CohortLevels;
  };
}

export default function GroupInfoSection({
  groupName,
  cohortId,
  studentCount,
  supervisor,
  cohort,
}: GroupInfoSectionProps) {
  return (
    <TooltipProvider>
      <Card className="border-border bg-card/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            معلومات المجموعة
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>تحرير المجموعة</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>أرشفة المجموعة</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>حذف المجموعة</TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Group Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoField label="اسم المجموعة" value={groupName} />
              <InfoField
                label="الدفعة"
                value={`${cohort.name} - ${
                  labels.dashboard.curriculum.levels[cohort.currentLevel]
                }`}
              />
              <InfoField label="عدد الطالبات" value={`${studentCount} طالبة`} />
            </div>
          </div>

          <Separator />

          {/* Supervisor Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-foreground">معلومات المشرفة</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/dashboard/users/${supervisor.id}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>عرض صفحة المشرفة</TooltipContent>
              </Tooltip>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField
                label="اسم المشرفة"
                value={`${supervisor.firstName} ${supervisor.middleName} ${supervisor.lastName}`}
                icon={<User className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
