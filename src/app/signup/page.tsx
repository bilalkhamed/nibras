import labels from '@/lib/labels.json';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignupPage() {
  return (
    <AuthForm
      mode="signup"
      title={labels.auth.signupTitle}
      subtitle={labels.auth.signupSubtitle}
      submitLabel={labels.common.signup}
      fields={[
        { id: 'fullname', type: 'text', placeholder: 'أدخلي اسمك الكامل', label: labels.common.fullName },
        { id: 'email', type: 'email', placeholder: 'name@example.com', label: labels.common.email },
        { id: 'password', type: 'password', label: labels.common.password },
        { id: 'confirm-password', type: 'password', label: labels.common.confirmPassword }
      ]}
      alternateText={labels.auth.hasAccount}
      alternateHref='/login'
      alternateLinkLabel={labels.auth.loginLink}
    />
  );
}
