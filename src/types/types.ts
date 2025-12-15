import { Role, UserStatus } from '../../prisma/generated';

export const ADMIN_ROLE = 'admin';
export const SUPERVISOR_ROLE = 'supervisor';
export const STUDENT_ROLE = 'student';

export const ACTIVE_STATUS = 'active';
export const FROZEN_STATUS = 'frozen';
export const DELETED_STATUS = 'deleted';

export { Role, UserStatus };

export type AccessTokenPayload = {
  userId: string;
  role: Role;
  expiresAt: Date;
};

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  middleName: string;
  lastName: string;
  birthYear: number;
  status: UserStatus;
  country?: string | null;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  cohortId: string;
  createdAt: Date;
  updatedAt: Date;
  supervisor: {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
  };
  _count: {
    students: number;
  };
}
