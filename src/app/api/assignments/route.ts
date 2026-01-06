import getAuthSession from '@/lib/server/auth-session';
import prisma from '@/lib/server/prisma';
import { ADMIN_ROLE, AssignmentTypes } from '@/types/types';
import {
  Assignment,
  AssignmentAttachment,
  AttachmentType,
  Prisma,
} from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  levelSlug: z.string().min(1),
  weekId: z.string().min(1),
  programSlug: z.string().min(1),
  assignment: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(AssignmentTypes),
    links: z.array(z.url()).optional(),
    fileKeys: z.array(z.string()).optional(),
  }),
});

export async function POST(req: NextRequest) {
  const auth = await getAuthSession();

  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (auth.role !== ADMIN_ROLE) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  let body: z.infer<typeof requestSchema>;

  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const { success, data, error } = requestSchema.safeParse(body);

  if (!success) {
    return NextResponse.json(
      { message: 'Invalid request', errors: error },
      { status: 400 }
    );
  }

  try {
    const attachments: Prisma.AssignmentAttachmentCreateManyAssignmentInputEnvelope =
      {
        data: {
          ...(data.assignment.links
            ? data.assignment.links.map((link) => ({
                type: AttachmentType.LINK,
                url: link,
              }))
            : []),
          ...(data.assignment.fileKeys
            ? data.assignment.fileKeys.map((key) => ({
                type: AttachmentType.FILE,
                fileKey: key,
              }))
            : []),
        },
      };
    const createdAssignment = await prisma.$transaction(async (tx) => {
      const level = await tx.level.findUnique({
        where: { slug: data.levelSlug },
      });

      if (!level) {
        throw new Error('Level not found', {
          cause: 'INVALID_INPUT',
        });
      }

      const week = await tx.week.findUnique({
        where: { id: data.weekId },
      });

      if (!week) {
        throw new Error('Week not found', {
          cause: 'INVALID_INPUT',
        });
      }

      const program = await tx.program.findUnique({
        where: { slug: data.programSlug },
      });

      if (!program) {
        throw new Error('Program not found', {
          cause: 'INVALID_INPUT',
        });
      }

      return await tx.assignment.create({
        data: {
          name: data.assignment.name,
          description: data.assignment.description || null,
          type: data.assignment.type as any,
          levelId: level.id,
          weekId: data.weekId,
          programId: program.id,
          attachments: {
            createMany: {
              data: attachments.data,
            },
          },
        },
      });
    });

    return NextResponse.json(
      { assignment: createdAssignment },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Error && err.cause === 'INVALID_INPUT') {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      {
        message: 'Error creating assignment',
      },
      { status: 500 }
    );
  }
}
