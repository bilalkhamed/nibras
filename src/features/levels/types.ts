import { Prisma } from '@prisma/client';
import { z } from 'zod';

// ============================================================================
// Zod Schemas
// ============================================================================

export const createLevelSchema = z.object({
  number: z.number().min(1, 'الرقم مطلوب'),
  title: z.string().min(1, 'العنوان مطلوب'),
  description: z.string().optional(),
});

// ============================================================================
// Inferred Types from Schemas
// ============================================================================

export type CreateLevelData = z.infer<typeof createLevelSchema>;

// ============================================================================
// Action Results
// ============================================================================

export type CreateLevelResult =
  | { success: true; levelId: string }
  | { success: false; error: string };

// ============================================================================
// DTOs
// ============================================================================

export const levelListSelect = {
  id: true,
  number: true,
  title: true,
  description: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LevelSelect;

export type LevelListDTO = Prisma.LevelGetPayload<{
  select: typeof levelListSelect;
}>;

export const levelDetailSelect = {
  id: true,
  number: true,
  title: true,
  description: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LevelSelect;

export type LevelDetailDTO = Prisma.LevelGetPayload<{
  select: typeof levelDetailSelect;
}>;
