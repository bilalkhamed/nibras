import type { Assignment } from '@prisma/client';

export type AssignmentStatus = {
  isCompleted: boolean;
  completedAt: Date | null;
  markedBy: {
    firstName: string;
    middleName: string | null;
    lastName: string;
  } | null;
};

export type StudentProgressStatus = 'warning' | 'pending' | 'done';

export type StudentProgress = {
  id: string;
  name: string;
  completedCount: number;
  totalAssignments: number;
  status: StudentProgressStatus;
  assignmentStatuses: Record<string, AssignmentStatus>;
};

export type StudentAssignmentDetail = {
  assignmentId: string;
  assignmentName: string;
  isCompleted: boolean;
  completedAt: Date | null;
  markedByName: string | null;
  markedBySelf: boolean;
};

export type ProgressViewProps = {
  assignments: Assignment[];
  students: StudentProgress[];
};

export type ViewMode = 'student' | 'assignment';

export type AssignmentProgressStatus = 'none' | 'partial' | 'complete';

export type AssignmentProgress = {
  id: string;
  name: string;
  completedCount: number;
  totalStudents: number;
  status: AssignmentProgressStatus;
  studentStatuses: Record<string, AssignmentStatus & { studentName: string }>;
};

// Optimistic update types
export type OptimisticAction = {
  type: 'toggle';
  studentId: string;
  assignmentId: string;
  newCompleted: boolean;
  markerName: string;
};
