import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { FormField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useAuth } from '../hooks/useAuth';
import { confirmPasswordRules, passwordRules } from '../validation/authValidation';

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPassword } = useAuth();
  const { control, handleSubmit, getValues } = useForm({
    defaultValues: { token: location.state?.token ?? '', password: '', confirmPassword: '' },
  });

  const onSubmit = ({ token, password }) => {
    resetPassword.mutate({ token, password }, { onSuccess: () => navigate('/login', { replace: true }) });
  };

  return (
    <Screen scroll>
      <div className="flex-1 flex flex-col px-6 py-8 mx-auto w-full max-w-sm">
        <ErrorBanner message={resetPassword.error?.message} />

        <FormField control={control} name="token" rules={{ required: 'Reset token is required' }} label="Reset token" placeholder="Paste your reset token" />
        <FormField control={control} name="password" rules={passwordRules} label="New password" placeholder="••••••••" secureTextEntry autoComplete="new-password" />
        <FormField
          control={control}
          name="confirmPassword"
          rules={confirmPasswordRules(() => getValues('password'))}
          label="Confirm new password"
          placeholder="••••••••"
          secureTextEntry
          autoComplete="new-password"
        />

        <Button title="Reset password" onPress={handleSubmit(onSubmit)} loading={resetPassword.isPending} />

        {resetPassword.isSuccess ? (
          <p className="mt-4 text-center text-sm text-success">Password reset — log in with your new password.</p>
        ) : null}
      </div>
    </Screen>
  );
}
