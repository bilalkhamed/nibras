'use server'; // Don't forget this!

import prisma from './prisma'; // Adjust path
import getAuthSession from './auth-session'; // Your auth helper

export async function toggleAssignmentCompletion(
  assignmentId: string, // Receive assignmentId, NOT the row ID
  isCompleted: boolean
) {
  // 1. SECURITY: Get the User ID from the session, not the client
  const session = await getAuthSession();
  if (!session?.userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // 2. LOGIC: Use 'upsert' to handle both "Create" and "Update"
    await prisma.studentAssignment.upsert({
      where: {
        // Use the composite unique key we defined in schema
        studentId_assignmentId: {
          studentId: session.userId,
          assignmentId: assignmentId,
        },
      },
      create: {
        studentId: session.userId,
        assignmentId: assignmentId,
        isCompleted: isCompleted, // Remove if you deleted this field
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        isCompleted: isCompleted, // Remove if you deleted this field
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // 3. CACHE: Update the "Instant Shell"
    // This makes the checkbox stick on the next reload

    return { success: true };
  } catch (error) {
    console.error('Toggle Error:', error);
    return { success: false, error: 'Failed to update status' };
  }
}
