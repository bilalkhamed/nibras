import { CohortListDTO, getAllCohorts } from '@/features/cohorts';
import { getAllUsers } from '../service';
import { UsersTable } from './users-table';
import { runServiceOrRedirect } from '@/lib/server/service/helpers';
import { Role } from '@prisma/client';
import getAuthSession from '@/lib/server/auth-session';

export async function UsersTableSection({ cohortId }: { cohortId?: string } = {}) {
  const res = await runServiceOrRedirect(() => getAllUsers({ cohortId }));

  if (!res.success) {
    return <div>Failed to load users.</div>;
  }

  const users = res.data;

  const cohortsResult = await getAllCohorts();
  let cohorts: CohortListDTO[] = [];

  if (cohortsResult.success) {
    cohorts = cohortsResult.data;
  }

  const session = await getAuthSession();

  return (
    <UsersTable
      users={users}
      cohorts={cohorts}
      roles={Object.values(Role).filter((v) => v !== Role.admin)}
      isDirector={session?.role === 'director'}
      hideCohortFilter={!!cohortId}
    />
  );
}
