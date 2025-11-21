import { Role } from '../../prisma/generated';

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
