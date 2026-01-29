'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  createColumnHelper,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import type { Assignment } from '@prisma/client';
import type {
  StudentProgress,
  StudentProgressStatus,
  ViewMode,
  AssignmentProgressStatus,
} from '../../types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { ProgressProvider, useProgressContext } from './progress-context';
import { ViewModeToggle } from './view-mode-toggle';
import {
  StudentProgressAccordionView,
  STATUS_CONFIG,
} from './student-progress-accordion-view';
import {
  AssignmentProgressAccordion,
  ASSIGNMENT_STATUS_CONFIG,
} from './assignment-progress-accordion';
import { StudentProgressTable } from './student-progress-table';

// Student columns for TanStack Table
const studentColumnHelper = createColumnHelper<StudentProgress>();
const studentColumns = [
  studentColumnHelper.accessor('name', {
    filterFn: 'includesString',
  }),
  studentColumnHelper.accessor('status', {
    filterFn: (row, columnId, filterValue: StudentProgressStatus | 'all') => {
      if (filterValue === 'all') return true;
      return row.getValue(columnId) === filterValue;
    },
  }),
];

type StudentStatusFilter = StudentProgressStatus | 'all';
type AssignmentStatusFilter = AssignmentProgressStatus | 'all';

interface StudentProgressContainerProps {
  assignments: Assignment[];
  students: StudentProgress[];
  currentUserName: string;
}

export function StudentProgressContainer({
  assignments,
  students,
  currentUserName,
}: StudentProgressContainerProps) {
  return (
    <ProgressProvider
      initialStudents={students}
      assignments={assignments}
      currentUserName={currentUserName}
    >
      <ProgressContent />
    </ProgressProvider>
  );
}

function ProgressContent() {
  const { students, assignmentProgress, assignments } = useProgressContext();

  const [viewMode, setViewMode] = useState<ViewMode>('student');
  const [studentColumnFilters, setStudentColumnFilters] =
    useState<ColumnFiltersState>([]);
  const [studentGlobalFilter, setStudentGlobalFilter] = useState('');
  const [assignmentStatusFilter, setAssignmentStatusFilter] =
    useState<AssignmentStatusFilter>('all');
  const [assignmentSearch, setAssignmentSearch] = useState('');

  // Student table
  const studentTable = useReactTable({
    data: students,
    columns: studentColumns,
    state: {
      columnFilters: studentColumnFilters,
      globalFilter: studentGlobalFilter,
    },
    onColumnFiltersChange: setStudentColumnFilters,
    onGlobalFilterChange: setStudentGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
  });

  const studentRows = studentTable.getRowModel().rows;
  const filteredStudents = useMemo(
    () => studentRows.map((row) => row.original),
    [studentRows],
  );
  const filteredStudentIds = useMemo(
    () => new Set(filteredStudents.map((s) => s.id)),
    [filteredStudents],
  );

  // Filter assignment progress
  const filteredAssignmentProgress = useMemo(() => {
    return assignmentProgress.filter((ap) => {
      const matchesSearch =
        !assignmentSearch ||
        ap.name.toLowerCase().includes(assignmentSearch.toLowerCase());
      const matchesStatus =
        assignmentStatusFilter === 'all' ||
        ap.status === assignmentStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assignmentProgress, assignmentSearch, assignmentStatusFilter]);

  const filteredAssignmentIds = useMemo(
    () => new Set(filteredAssignmentProgress.map((a) => a.id)),
    [filteredAssignmentProgress],
  );

  const studentStatusFilter =
    (studentColumnFilters.find((f) => f.id === 'status')
      ?.value as StudentStatusFilter) ?? 'all';

  const handleStudentStatusChange = (value: StudentStatusFilter) => {
    if (value === 'all') {
      setStudentColumnFilters((prev) => prev.filter((f) => f.id !== 'status'));
    } else {
      setStudentColumnFilters((prev) => {
        const filtered = prev.filter((f) => f.id !== 'status');
        return [...filtered, { id: 'status', value }];
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with view mode toggle */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Filter Controls - different based on view mode */}
      {viewMode === 'student' ? (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن طالبة..."
              value={studentGlobalFilter}
              onChange={(e) => setStudentGlobalFilter(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select
            dir="rtl"
            value={studentStatusFilter}
            onValueChange={handleStudentStatusChange}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'p-1 rounded-full flex items-center justify-center',
                        config.bgClassName,
                      )}
                    >
                      <config.icon
                        className={cn('h-3 w-3', config.className)}
                      />
                    </span>
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن مهمة..."
              value={assignmentSearch}
              onChange={(e) => setAssignmentSearch(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select
            dir="rtl"
            value={assignmentStatusFilter}
            onValueChange={(v) =>
              setAssignmentStatusFilter(v as AssignmentStatusFilter)
            }
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {Object.entries(ASSIGNMENT_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'p-1 rounded-full flex items-center justify-center',
                        config.bgClassName,
                      )}
                    >
                      <config.icon
                        className={cn('h-3 w-3', config.className)}
                      />
                    </span>
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {viewMode === 'student' ? (
          <>
            عرض {filteredStudents.length} من {students.length} طالبة
          </>
        ) : (
          <>
            عرض {filteredAssignmentProgress.length} من{' '}
            {assignmentProgress.length} مهمة
          </>
        )}
      </p>

      {/* Content based on view mode */}
      {viewMode === 'student' ? (
        <>
          {/* Desktop View - Table (md and up)
          <div className="hidden md:block">
            <StudentProgressTable
              assignments={assignments}
              students={filteredStudents}
            />
          </div> */}

          {/* Mobile View - Accordion (below md) */}
          <StudentProgressAccordionView
            filteredStudentIds={filteredStudentIds}
          />
        </>
      ) : (
        <AssignmentProgressAccordion
          filteredAssignmentIds={filteredAssignmentIds}
        />
      )}
    </div>
  );
}
