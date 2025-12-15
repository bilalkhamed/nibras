import { DashboardTabs } from './components/dashboard-tabs';
import { DashboardHeader } from './components/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <DashboardTabs />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <DashboardHeader />
        {children}
      </main>
    </div>
  );
}
