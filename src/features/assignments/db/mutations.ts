import 'server-only';

import prisma from '@/lib/server/prisma';
import { AssignmentTypes, AttachmentType } from '@prisma/client';
import { CreateAssignmentData, createAssignmentSchema } from '../types/schema';

export async function toggleAssignmentCompletion(
  assignmentId: string,
  isCompleted: boolean,
  studentId: string,
  markedById: string,
) {
  try {
    await prisma.studentAssignment.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId: assignmentId,
        },
      },
      create: {
        studentId,
        assignmentId: assignmentId,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
        markedById,
      },
      update: {
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
        markedById,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Toggle Error:', error);
    return { success: false, error };
  }
}

export async function deleteAssignment(assignmentId: string) {
  try {
    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return { success: true };
  } catch (error) {
    console.error('Delete Assignment Error:', error);
    return { success: false, error: 'Failed to delete assignment' };
  }
}

export async function updateAssignment(
  assignmentId: string,
  data: {
    name: string;
    description: string | null;
    type: AssignmentTypes;
    links?: { id?: string; url: string; type: typeof AttachmentType.LINK }[];
    fileKeys: string[];
  },
) {
  try {
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
      },
    });

    return { success: true, assignment: updated };
  } catch (error) {
    console.error('Update Assignment Error:', error);
    return { success: false };
  }
}

export async function createAssignment(input: CreateAssignmentData) {
  const { success, data, error } = createAssignmentSchema.safeParse(input);

  if (!success) {
    return {
      success: false,
      error: 'Invalid input',
      validationErrors: error,
    };
  }

  try {
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

    const newAssignment = await prisma.$transaction(async (tx) => {
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

      return await tx.assignment.create({
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

    return { success: true, assignment: newAssignment };
  } catch (error) {
    console.error('Create Assignment Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create assignment',
    };
  }
}
