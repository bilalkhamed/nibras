'use client';

/*
  TODO: Complete onboarding page,
  and either redirect if name is undefined, or fetch the name from the server
*/

import { useEffect, useState } from 'react';

export default function OnboardingPage() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    setName(localStorage.getItem('name'));
    localStorage.removeItem('name');
  }, []);
  return <div>مرحبا {name}</div>;
}
