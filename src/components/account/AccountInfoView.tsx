import type { User } from '@/types/types';
import { UserInfoSection } from './UserInfoSection';
import { GroupInfoSection } from './GroupInfoSection';

type Props = {
  user: User;
};

export function AccountInfoView({ user }: Props) {
  return (
    <div className="space-y-6">
      <UserInfoSection user={user} />
      <GroupInfoSection />
    </div>
  );
}
