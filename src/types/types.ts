import { Role } from '../../prisma/generated';

export const ADMIN_ROLE = 'admin';
export const SUPERVISOR_ROLE = 'supervisor';
export const STUDENT_ROLE = 'student';

export { Role };

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  middleName: string;
  lastName: string;
  birthYear: number;
  createdAt: Date;
  updatedAt: Date;
}
