'use client';

import React, { useEffect, useState } from 'react';
import type { User } from '@/types/types';
import { AccountNavBar } from './AccountNavBar';
import { AccountInfoView } from './AccountInfoView';
import { SettingsView } from './SettingsView';

type Props = { user: User };

export function AccountTabs({ user }: Props) {
  const [sticky, setSticky] = useState(false);
  const [tab, setTab] = useState<'account' | 'settings'>('account');

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setSticky(y > 80);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <AccountNavBar activeTab={tab} onTabChange={setTab} sticky={sticky} />
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {tab === 'account' ? <AccountInfoView user={user} /> : <SettingsView />}
      </main>
    </div>
  );
}
