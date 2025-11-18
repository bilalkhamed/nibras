'use client';

import labels from '@/lib/labels.json';
import { AddUserForm } from '@/components/dashboard/add-user-form';
import { UsersTable } from '@/components/dashboard/users-table';
import { UserStats } from '@/components/dashboard/stats';
import { DashboardTabs } from '@/components/layout/DashboardTabs';
import { useState } from 'react';
import Curriculum from '@/components/dashboard/curriculum/curriculum';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'curriculum' | 'stats'>(
    'users'
  );
  return (
    <div className="min-h-screen bg-background">
      <DashboardTabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as 'users' | 'curriculum' | 'stats')
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 animate-in fade-in duration-500">
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 leading-[3]">
            {labels.dashboard.title[activeTab]}
          </h1>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <section className="space-y-6 animate-in fade-in duration-300">
            <AddUserForm />
            <UsersTable />
          </section>
        )}

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
