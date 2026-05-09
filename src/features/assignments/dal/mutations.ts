/**
 * Assignment DAL - Mutation Operations
 *
 * Pure database mutations for assignment data.
 * These functions should ONLY be called from the service layer.
 */

import 'server-only';

import prisma from '@/lib/server/prisma';
import { AssignmentTypes, AttachmentType } from '@prisma/client';
import { runDalOperation } from '@/lib/server/dal/helpers';
import type {
  AssignmentDTO,
  CreateAssignmentData,
  StudentAssignmentDTO,
  UpdateAssignmentData,
  UpdateStudentAssignmentInputDal,
} from '../types';
import { revalidateTag } from 'next/cache';
import { DalReturn } from '@/lib/server/dal/types';

// ============================================================================
// Student Assignment Mutations
// ============================================================================

/**
 * Toggle assignment completion status for a student
 * Uses upsert to create or update the student assignment record
 *
 * @param assignmentId - The assignment ID
 * @param studentId - The student's user ID
 * @param isCompleted - Whether the assignment is completed
 * @param markedById - User ID of who marked the completion
 * @returns The updated student assignment record
 */
export async function upsertStudentAssignment({
  assignmentId,
  studentId,
  data,
}: UpdateStudentAssignmentInputDal): Promise<DalReturn<StudentAssignmentDTO>> {
  return runDalOperation<StudentAssignmentDTO>(async () => {
    return prisma.studentAssignment.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId,
        },
        ...(data.isCompleted === false && {
          fileKey: null,
          textSubmission: null,
        }),
      },
      create: {
        studentId,
        assignmentId,
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
        markedById: data.markedById,
        gradedById: data.markedById,
        textSubmission: data.textSubmission || null,
        fileKey: data.fileKey || null,
        score: data.score || null,
        comment: data.comment || null,
      },
      update: {
        isCompleted: data.isCompleted,
        completedAt: data.isCompleted ? new Date() : null,
        ...(data.markedById && { markedById: data.markedById }),
        ...(data.textSubmission && { textSubmission: data.textSubmission }),
        ...(data.fileKey && { fileKey: data.fileKey }),
        ...(data.gradedById && { gradedById: data.gradedById }),
        ...(data.score && { score: data.score }),
        ...(data.comment && { comment: data.comment }),
      },
    });
  });
}

// ============================================================================
// Assignment CRUD Mutations
// ============================================================================

/**
 * Delete an assignment by ID
 * Also deletes all related student assignments and attachments (via cascade)
 *
 * @param assignmentId - The assignment ID to delete
 * @returns The deleted assignment
 */
export async function deleteAssignmentById(assignmentId: string) {
  return runDalOperation<AssignmentDTO>(async () => {
    return prisma.assignment.delete({
      where: { id: assignmentId },
    });
  });
}

export async function updateAssignment(
  assignmentId: string,
  data: UpdateAssignmentData,
) {
  return runDalOperation<AssignmentDTO>(async () => {
    const existingAttachments = await prisma.assignmentAttachment.findMany({
      where: {
        assignmentId: assignmentId,
      },
    });

    if (data.links) {
      const existingLinks = existingAttachments.filter(
        (att) => att.type === AttachmentType.LINK,
      );

      const linksToDelete = existingLinks.filter(
        (link) => !data.links?.some((l) => l.id === link.id),
      );

      const linksToAdd = data.links.filter((link) => !link.id);

      const linksToUpdate = data.links.filter((link) => {
        if (!link.id) return false;

        const original = existingLinks.find((db) => db.id === link.id);

        return original && original.url !== link.url;
      });

      await prisma.$transaction([
        prisma.assignmentAttachment.deleteMany({
          where: {
            id: { in: linksToDelete.map((link) => link.id) },
            assignmentId: assignmentId,
          },
        }),
        ...linksToUpdate.map((link) =>
          prisma.assignmentAttachment.update({
            where: { id: link.id!, assignmentId: assignmentId },
            data: { url: link.url },
          }),
        ),
        prisma.assignmentAttachment.createMany({
          data: linksToAdd.map((link) => ({
            assignmentId: assignmentId,
            type: AttachmentType.LINK,
            url: link.url,
          })),
        }),
      ]);
    }

    if (data.fileKeys) {
      const existingFiles = existingAttachments.filter(
        (att) => att.type === AttachmentType.FILE,
      );

      const filesToDelete = existingFiles.filter(
        (file) => !data.fileKeys.includes(file.fileKey!),
      );

      const filesToAdd = data.fileKeys.filter(
        (key) => !existingFiles.some((file) => file.fileKey === key),
      );

      await prisma.$transaction([
        prisma.assignmentAttachment.deleteMany({
          where: {
            id: { in: filesToDelete.map((file) => file.id) },
            assignmentId: assignmentId,
          },
        }),
        prisma.assignmentAttachment.createMany({
          data: filesToAdd.map((key) => ({
            assignmentId: assignmentId,
            type: AttachmentType.FILE,
            fileKey: key,
          })),
        }),
      ]);
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        allowFileSubmission: data.allowFileSubmission,
        allowTextSubmission: data.allowTextSubmission,
        maxScore: data.maxScore,
      },
    });

    revalidateTag(
      `assignments-level-${updated.levelId}-week-${updated.weekId}-program-${updated.programId}`,
      'max',
    );
    revalidateTag(
      `assignments-level-${updated.levelId}-week-${updated.weekId}`,
      'max',
    );
    return updated;
  });
}

// ============================================================================
// Create Assignment
// ============================================================================

/**
 * Create a new assignment with attachments
 * Validates level, week, and program existence in a transaction
 *
 * @param data - The assignment creation data
 * @returns The created assignment
 */
export async function insertAssignment(data: CreateAssignmentData) {
  return runDalOperation<AssignmentDTO>(async () => {
    const attachmentsData = [
      ...(data.assignment.links || []).map((link) => ({
        type: AttachmentType.LINK,
        url: link.url,
      })),
      ...(data.assignment.fileKeys || []).map((key) => ({
        type: AttachmentType.FILE,
        fileKey: key,
      })),
    ];

    const created = await prisma.$transaction(async (tx) => {
      // Validate all referenced entities exist
      const level = await tx.level.findUnique({
        where: { slug: data.levelSlug },
      });

      if (!level) {
        throw new Error('Level not found');
      }

      const week = await tx.week.findUnique({
        where: { id: data.weekId },
      });

      if (!week) {
        throw new Error('Week not found');
      }

      const program = await tx.program.findUnique({
        where: { slug: data.programSlug },
      });

      if (!program) {
        throw new Error('Program not found');
      }

      // Create the assignment with attachments
      return await tx.assignment.create({
        data: {
          name: data.assignment.name,
          description: data.assignment.description || null,
          type: data.assignment.type as AssignmentTypes,
          levelId: level.id,
          weekId: data.weekId,
          programId: program.id,
          allowFileSubmission: data.assignment.allowFileSubmission,
          allowTextSubmission: data.assignment.allowTextSubmission,
          maxScore: data.assignment.maxScore,
          attachments: {
            createMany: {
              data: attachmentsData,
            },
          },
        },
      });
    });

    revalidateTag(
      `assignments-level-${created.levelId}-week-${created.weekId}-program-${created.programId}`,
      'max',
    );
    revalidateTag(
      `assignments-level-${created.levelId}-week-${created.weekId}`,
      'max',
    );

    return created;
  });
}
