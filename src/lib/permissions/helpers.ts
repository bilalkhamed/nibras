import { AccessTokenPayload } from '@/types/types';

export function canAccessStudentAssignments(
  session: AccessTokenPayload | null,
): boolean {
  if (!session) return false;

  const { role, supervisorStatus } = session;

  return (
    role == 'student' ||
    (role === 'supervisor' && supervisorStatus === 'in_training')
  );
}
