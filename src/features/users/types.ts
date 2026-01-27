import { Cohort, Prisma, User } from '@prisma/client';

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

const userByEmailSelect = {
  id: true,
  email: true,
  role: true,
  status: true,
  hashedPassword: true,
  firstName: true,
  lastName: true,
  groupsAsStudent: {
    where: { isActive: true },
  },
  cohort: {
    select: {
      currentLevelId: true,
    },
  },
} satisfies Prisma.UserSelect;

export type UserByEmail = Prisma.UserGetPayload<{
  select: typeof userByEmailSelect;
}>;
