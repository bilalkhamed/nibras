'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const handleLogOut = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    router.push('/login');
  };

  return (
    <Button variant="outline" className="mt-4 w-full" onClick={handleLogOut}>
      تسجيل الخروج
    </Button>
  );
}
