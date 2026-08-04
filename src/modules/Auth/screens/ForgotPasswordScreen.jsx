import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { FormField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useAuth } from '../hooks/useAuth';
import { emailRules } from '../validation/authValidation';

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const { control, handleSubmit } = useForm({ defaultValues: { email: '' } });

  const onSubmit = ({ email }) => {
    forgotPassword.mutate(
      { email },
      {
        // No SMTP is configured on the backend, so it hands back the reset
        // token directly instead of emailing it — go straight to the reset
        // screen with it prefilled rather than making the user copy/paste.
        onSuccess: (result) => navigate('/reset-password', { state: { token: result.resetToken ?? '' } }),
      }
    );
  };

  return (
    <Screen scroll>
      <div className="flex-1 flex flex-col px-6 py-8 mx-auto w-full max-w-sm">
        <p className="mb-2 text-base text-gray-500 dark:text-gray-400">
          Enter the email on your account and we'll get you a reset token.
        </p>

        <div className="mt-6">
          <ErrorBanner message={forgotPassword.error?.message} />

          <FormField
            control={control}
            name="email"
            rules={emailRules}
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Button title="Send reset token" onPress={handleSubmit(onSubmit)} loading={forgotPassword.isPending} />
        </div>
      </div>
    </Screen>
  );
}
