import { AssignmentTypes, AttachmentType } from '@prisma/client';
import { z } from 'zod';

export const createAssignmentSchema = z.object({
  levelSlug: z.string().min(1),
  weekId: z.string().min(1),
  programSlug: z.string().min(1),
  assignment: z.object({
    name: z.string().min(1),
    description: z.string().nullable(),
    type: z.enum(AssignmentTypes),
    fileKeys: z.array(z.string()).optional(),
    links: z
      .array(
        z.object({
          url: z.url(),
          id: z.string().optional(),
          type: z.literal(AttachmentType.LINK),
        }),
      )
      .optional(),
  }),
});

export type CreateAssignmentData = z.infer<typeof createAssignmentSchema>;
