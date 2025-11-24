import labels from '@/lib/labels.json';
import { UserStats } from '@/components/dashboard/stats';
import { DashboardTabs } from '@/components/layout/DashboardTabs';
import Curriculum from '@/components/dashboard/curriculum/curriculum';
import UsersSection from '@/components/dashboard/users/users-section';

type SearchParams = {
  tab?: 'users' | 'curriculum' | 'stats';
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const activeTab = (await searchParams).tab || 'users';

  // Fetch users data for UsersSection

  return (
    <div className="min-h-screen bg-background">
      <DashboardTabs value={activeTab} />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 animate-in fade-in duration-500">
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 leading-[3]">
            {labels.dashboard.title[activeTab]}
          </h1>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && <UsersSection />}

        {/* Curriculum Tab */}
        {activeTab === 'curriculum' && <Curriculum />}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <UserStats />
          </section>
        )}
      </main>
    </div>
  );
}
