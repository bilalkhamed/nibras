import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import labels from '@/lib/labels.json';
import { InvalidInvite } from './invalid-invite';
import { InviteSuccessForm } from './invite-success-form';
import prisma from '@/lib/prisma';

async function validateInviteCode(code: string): Promise<{
  valid: boolean;
  user?: { id: string; firstName: string };
  status?: number;
}> {
  const validFormat = /^[A-Z0-9]{6}\.[a-f0-9]{64}$/i.test(code);
  if (!validFormat) {
    {
      return { valid: false };
    }
  }

  const [selector, validator] = code.split('.');
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/invite/validate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inviteCode: code }),
    }
  );

  if (!res.ok) {
    return { valid: false, status: res.status };
  }

  const data = await res.json();
  return {
    valid: true,
    user: data.user,
    status: res.status,
  };
}

export default async function InviteCodePage({
  params,
}: {
  params: { code: string };
}) {
  const { code } = await params;
  const { valid, user, status } = await validateInviteCode(code);

  if (!valid || !user) {
    return <InvalidInvite status={status || 400} />;
  }

  return <InviteSuccessForm inviteCode={code} user={user} />;
}
