import { InvalidInvite } from './invalid-invite';
import { InviteSuccessForm } from './invite-success-form';

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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/invite/validate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inviteCode: code }),
    },
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
  let result;
  try {
    result = await validateInviteCode(code);
  } catch (err) {
    console.error(err);
    return <InvalidInvite status={500} />;
  }

  const { valid, user, status } = result;

  if (!valid || !user) {
    return <InvalidInvite status={status || 400} />;
  }

  return <InviteSuccessForm inviteCode={code} user={user} />;
}
