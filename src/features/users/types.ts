import { Cohort, User } from '@prisma/client';

export type UserDTO = Pick<
  User,
  | 'id'
  | 'firstName'
  | 'middleName'
  | 'lastName'
  | 'email'
  | 'role'
  | 'birthYear'
  | 'country'
  | 'status'
  | 'phone'
>;

export type UserWithCohortDTO = UserDTO & {
  cohort: Pick<Cohort, 'id' | 'name'> | null;
};
