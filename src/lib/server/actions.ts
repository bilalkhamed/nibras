'use server';

import prisma from './prisma';
import getAuthSession from './auth-session';
import { ADMIN_ROLE } from '@/types/types';
import { AssignmentTypes, AttachmentType, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function toggleAssignmentCompletion(
  assignmentId: string,
  isCompleted: boolean
) {
  const session = await getAuthSession();
  if (!session?.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.studentAssignment.upsert({
      where: {
        studentId_assignmentId: {
          studentId: session.userId,
          assignmentId: assignmentId,
        },
      },
      create: {
        studentId: session.userId,
        assignmentId: assignmentId,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Toggle Error:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

export async function deleteAssignment(assignmentId: string) {
  const session = await getAuthSession();
  if (!session?.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  if (session.role !== ADMIN_ROLE) {
    return { success: false, error: 'Forbidden: Admin access required' };
  }

  try {
    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    revalidatePath('/dashboard/programs/[slug]/[level]/[week]', 'page');
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
  }
) {
  const session = await getAuthSession();
  if (!session?.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  if (session.role !== ADMIN_ROLE) {
    return { success: false, error: 'Forbidden: Admin access required' };
  }

  try {
    if (data.links) {
      const existingLinks = await prisma.assignmentAttachment.findMany({
        where: {
          assignmentId: assignmentId,
          type: AttachmentType.LINK,
        },
      });

      const linksToDelete = existingLinks.filter(
        (link) => !data.links?.some((l) => l.id === link.id)
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
          })
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

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
      },
    });
    revalidatePath('/dashboard/programs/[slug]/[level]/[week]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Update Assignment Error:', error);
    return { success: false };
  }
}

const createAssignmentSchema = z.object({
  levelSlug: z.string().min(1),
  weekId: z.string().min(1),
  programSlug: z.string().min(1),
  assignment: z.object({
    name: z.string().min(1),
    description: z.string().nullable(),
    type: z.enum(AssignmentTypes),
    links: z
      .array(
        z.object({
          url: z.url(),
          id: z.string().optional(),
          type: z.literal(AttachmentType.LINK),
        })
      )
      .optional(),
  }),
});

export async function createAssignment(
  input: z.infer<typeof createAssignmentSchema>
) {
  const session = await getAuthSession();

  if (!session?.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  if (session.role !== ADMIN_ROLE) {
    return { success: false, error: 'Forbidden: Admin access required' };
  }

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
    ];

    await prisma.$transaction(async (tx) => {
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

      await tx.assignment.create({
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

    revalidatePath('/dashboard/programs/[slug]/[level]/[week]', 'page');
    return { success: true };
  } catch (error) {
    console.error('Create Assignment Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create assignment',
    };
  }
}
