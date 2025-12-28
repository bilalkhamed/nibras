'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { LogOutIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton({ sideBar }: { sideBar?: boolean }) {
  const router = useRouter();
  const handleLogOut = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    router.push('/login');
  };

  if (sideBar) {
    return (
      <DropdownMenuItem
        dir="rtl"
        // className="text-destructive hover:bg-destructive/10 "
      >
        <LogOutIcon />
        تسجيل الخروج
      </DropdownMenuItem>
    );
  }
  return (
    <Button variant="outline" className="mt-4 w-full" onClick={handleLogOut}>
      تسجيل الخروج
    </Button>
  );
}
