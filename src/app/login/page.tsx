import labels from '@/lib/labels.json';
import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <AuthForm
      mode="login"
      title={labels.auth.loginTitle}
      subtitle={labels.auth.loginSubtitle}
      submitLabel={labels.common.login}
      fields={[
        { id: 'email', type: 'email', placeholder: 'name@example.com', label: labels.common.email },
        { id: 'password', type: 'password', label: labels.common.password }
      ]}
      alternateText={labels.auth.noAccount}
      alternateHref='/signup'
      alternateLinkLabel={labels.auth.signupLink}
    />
  );
}
