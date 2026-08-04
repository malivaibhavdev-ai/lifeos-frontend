import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { FormField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useAuth } from '../hooks/useAuth';
import { emailRules, loginPasswordRules } from '../validation/authValidation';

export function LoginScreen() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { control, handleSubmit } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = (values) => login.mutate(values, { onSuccess: () => navigate('/') });

  return (
    <Screen scroll>
      <div className="flex-1 flex flex-col justify-center px-6 py-10 mx-auto w-full max-w-sm">
        <p className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">Welcome back</p>
        <p className="mb-8 text-base text-gray-500 dark:text-gray-400">Log in to continue to LifeOS</p>

        <ErrorBanner message={login.error?.message} />

        <FormField
          control={control}
          name="email"
          rules={emailRules}
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
        />
        <FormField
          control={control}
          name="password"
          rules={loginPasswordRules}
          label="Password"
          placeholder="••••••••"
          secureTextEntry
          autoComplete="password"
        />

        <Link to="/forgot-password" className="mb-6 self-end text-sm font-medium text-primary-600">
          Forgot password?
        </Link>

        <Button title="Log in" onPress={handleSubmit(onSubmit)} loading={login.isPending} />

        <div className="mt-6 flex flex-row justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Don't have an account? </span>
          <Link to="/register" className="text-sm font-semibold text-primary-600">
            Sign up
          </Link>
        </div>
      </div>
    </Screen>
  );
}
