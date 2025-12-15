'use client';

import { useEffect, useState } from 'react';
import { AccountNavBar } from './account-nav-bar';

export function AccountTabs() {
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

  return <AccountNavBar activeTab={tab} onTabChange={setTab} sticky={sticky} />;
}
