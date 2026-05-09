'use client';

import {
  createContext,
  useContext,
  useOptimistic,
  startTransition,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Assignment } from '@prisma/client';
import type {
  StudentProgress,
  StudentProgressStatus,
  AssignmentStatus,
  AssignmentProgress,
  AssignmentProgressStatus,
} from '../../types';
import { updateStudentAssignmentAction } from '@/features/assignments/actions';

type OptimisticAction = {
  studentId: string;
  assignmentId: string;
  newCompleted: boolean;
};

type ProgressContextType = {
  students: StudentProgress[];
  assignments: Assignment[];
  assignmentProgress: AssignmentProgress[];
  toggleCompletion: (
    studentId: string,
    assignmentId: string,
    currentCompleted: boolean,
  ) => void;
  getStudentStatus: (
    studentId: string,
    assignmentId: string,
  ) => AssignmentStatus;
  currentUserName: string;
};

const ProgressContext = createContext<ProgressContextType | null>(null);

export function useProgressContext() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error(
      'useProgressContext must be used within a ProgressProvider',
    );
  }
  return context;
}

function computeStudentStatus(
  completedCount: number,
  totalAssignments: number,
): StudentProgressStatus {
  if (totalAssignments === 0 || completedCount === 0) return 'warning';
  if (completedCount === totalAssignments) return 'done';
  return 'pending';
}

function computeAssignmentStatus(
  completedCount: number,
  totalStudents: number,
): AssignmentProgressStatus {
  if (totalStudents === 0 || completedCount === 0) return 'none';
  if (completedCount === totalStudents) return 'complete';
  return 'partial';
}

function applyOptimisticUpdate(
  students: StudentProgress[],
  action: OptimisticAction,
  currentUserName: string,
  weekEndDate: Date,
): StudentProgress[] {
  return students.map((student) => {
    if (student.id !== action.studentId) return student;

    const newStatuses = { ...student.assignmentStatuses };

    const completedAt = action.newCompleted ? new Date() : null;
    const isOverdue =
      action.newCompleted && completedAt ? completedAt > weekEndDate : false;

    newStatuses[action.assignmentId] = {
      isCompleted: action.newCompleted,
      completedAt,
      isOverdue,
      markedBy: action.newCompleted
        ? {
            firstName: currentUserName.split(' ')[0] || '',
            middleName: null,
            lastName: currentUserName.split(' ').slice(1).join(' ') || '',
          }
        : null,
    };

    const newCompletedCount = Object.values(newStatuses).filter(
      (s) => s.isCompleted,
    ).length;

    return {
      ...student,
      assignmentStatuses: newStatuses,
      completedCount: newCompletedCount,
      status: computeStudentStatus(newCompletedCount, student.totalAssignments),
    };
  });
}

interface ProgressProviderProps {
  children: ReactNode;
  initialStudents: StudentProgress[];
  assignments: Assignment[];
  currentUserName: string;
  weekEndDate: Date;
}

export function ProgressProvider({
  children,
  initialStudents,
  assignments,
  currentUserName,
  weekEndDate,
}: ProgressProviderProps) {
  const [optimisticStudents, updateOptimisticStudents] = useOptimistic(
    initialStudents,
    (state, action: OptimisticAction) =>
      applyOptimisticUpdate(state, action, currentUserName, weekEndDate),
  );

  const toggleCompletion = useCallback(
    (studentId: string, assignmentId: string, currentCompleted: boolean) => {
      const newCompleted = !currentCompleted;

      startTransition(async () => {
        updateOptimisticStudents({
          studentId,
          assignmentId,
          newCompleted,
        });

        await updateStudentAssignmentAction({
          assignmentId,
          studentId,
          data: {
            isCompleted: newCompleted,
            score: newCompleted
              ? assignments.find((a) => a.id === assignmentId)?.maxScore
              : undefined,
          },
        });
      });
    },
    [updateOptimisticStudents, assignments],
  );

  const getStudentStatus = useCallback(
    (studentId: string, assignmentId: string): AssignmentStatus => {
      const student = optimisticStudents.find((s) => s.id === studentId);
      return (
        student?.assignmentStatuses[assignmentId] ?? {
          isCompleted: false,
          completedAt: null,
          markedBy: null,
          isOverdue: false,
        }
      );
    },
    [optimisticStudents],
  );

  // Compute assignment progress from students
  const assignmentProgress = useMemo((): AssignmentProgress[] => {
    return assignments.map((assignment) => {
      const studentStatuses: Record<
        string,
        AssignmentStatus & { studentName: string }
      > = {};
      let completedCount = 0;

      for (const student of optimisticStudents) {
        const status = student.assignmentStatuses[assignment.id] ?? {
          isCompleted: false,
          completedAt: null,
          markedBy: null,
          isOverdue: false,
        };
        studentStatuses[student.id] = {
          ...status,
          studentName: student.name,
        };
        if (status.isCompleted) completedCount++;
      }

      return {
        id: assignment.id,
        name: assignment.name,
        completedCount,
        totalStudents: optimisticStudents.length,
        status: computeAssignmentStatus(
          completedCount,
          optimisticStudents.length,
        ),
        studentStatuses,
      };
    });
  }, [assignments, optimisticStudents]);

  const value = useMemo(
    () => ({
      students: optimisticStudents,
      assignments,
      assignmentProgress,
      toggleCompletion,
      getStudentStatus,
      currentUserName,
    }),
    [
      optimisticStudents,
      assignments,
      assignmentProgress,
      toggleCompletion,
      getStudentStatus,
      currentUserName,
    ],
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}
