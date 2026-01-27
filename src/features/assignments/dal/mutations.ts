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
} from '../types';

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
export async function upsertStudentAssignment(
  assignmentId: string,
  studentId: string,
  isCompleted: boolean,
  markedById: string,
) {
  return runDalOperation<StudentAssignmentDTO>(async () => {
    return prisma.studentAssignment.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId,
        },
      },
      create: {
        studentId,
        assignmentId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        markedById,
      },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        markedById,
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

/**
 * Update an assignment's basic information
 *
 * @param assignmentId - The assignment ID to update
 * @param data - The data to update (name, description, type)
 * @returns The updated assignment
 */
export async function updateAssignmentBasic(
  assignmentId: string,
  data: {
    name: string;
    description: string | null;
    type: AssignmentTypes;
  },
) {
  return runDalOperation<AssignmentDTO>(async () => {
    return prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
      },
    });
  });
}

/**
 * Update assignment attachments (links)
 * Handles add, update, and delete operations for link attachments
 *
 * @param assignmentId - The assignment ID
 * @param links - Array of link data with optional IDs
 */
export async function updateAssignmentLinks(
  assignmentId: string,
  links: { id?: string; url: string }[],
) {
  return runDalOperation(async () => {
    const existingAttachments = await prisma.assignmentAttachment.findMany({
      where: { assignmentId },
    });

    const existingLinks = existingAttachments.filter(
      (att) => att.type === AttachmentType.LINK,
    );

    // Determine which links to delete, update, and add
    const linksToDelete = existingLinks.filter(
      (link) => !links.some((l) => l.id === link.id),
    );

    const linksToAdd = links.filter((link) => !link.id);

    const linksToUpdate = links.filter((link) => {
      if (!link.id) return false;
      const original = existingLinks.find((db) => db.id === link.id);
      return original && original.url !== link.url;
    });

    // Execute all operations in a transaction
    await prisma.$transaction([
      prisma.assignmentAttachment.deleteMany({
        where: {
          id: { in: linksToDelete.map((link) => link.id) },
          assignmentId,
        },
      }),
      ...linksToUpdate.map((link) =>
        prisma.assignmentAttachment.update({
          where: { id: link.id!, assignmentId },
          data: { url: link.url },
        }),
      ),
      prisma.assignmentAttachment.createMany({
        data: linksToAdd.map((link) => ({
          assignmentId,
          type: AttachmentType.LINK,
          url: link.url,
        })),
      }),
    ]);
  });
}

/**
 * Update assignment file attachments
 * Handles add and delete operations for file attachments
 *
 * @param assignmentId - The assignment ID
 * @param fileKeys - Array of S3 file keys that should remain attached
 */
export async function updateAssignmentFiles(
  assignmentId: string,
  fileKeys: string[],
) {
  return runDalOperation(async () => {
    const existingAttachments = await prisma.assignmentAttachment.findMany({
      where: { assignmentId },
    });

    const existingFiles = existingAttachments.filter(
      (att) => att.type === AttachmentType.FILE,
    );

    // Determine which files to delete and add
    const filesToDelete = existingFiles.filter(
      (file) => !fileKeys.includes(file.fileKey!),
    );

    const filesToAdd = fileKeys.filter(
      (key) => !existingFiles.some((file) => file.fileKey === key),
    );

    // Execute all operations in a transaction
    await prisma.$transaction([
      prisma.assignmentAttachment.deleteMany({
        where: {
          id: { in: filesToDelete.map((file) => file.id) },
          assignmentId,
        },
      }),
      prisma.assignmentAttachment.createMany({
        data: filesToAdd.map((key) => ({
          assignmentId,
          type: AttachmentType.FILE,
          fileKey: key,
        })),
      }),
    ]);
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

    return prisma.$transaction(async (tx) => {
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
      return tx.assignment.create({
        data: {
          name: data.assignment.name,
          description: data.assignment.description || null,
          type: data.assignment.type as AssignmentTypes,
          levelId: level.id,
          weekId: data.weekId,
          programId: program.id,
          attachments: {
            createMany: {
              data: attachmentsData,
            },
          },
        },
      });
    });
  });
}
