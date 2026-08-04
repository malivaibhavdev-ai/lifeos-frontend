import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { FormField } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useAuth } from '../hooks/useAuth';
import { confirmPasswordRules, emailRules, nameRules, passwordRules } from '../validation/authValidation';

export function RegisterScreen() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { control, handleSubmit, getValues } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = ({ name, email, password }) =>
    register.mutate({ name, email, password }, { onSuccess: () => navigate('/') });

  return (
    <Screen scroll>
      <div className="flex-1 flex flex-col justify-center px-6 py-10 mx-auto w-full max-w-sm">
        <p className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">Create account</p>
        <p className="mb-8 text-base text-gray-500 dark:text-gray-400">Start managing your life with LifeOS</p>

        <ErrorBanner message={register.error?.message} />

        <FormField control={control} name="name" rules={nameRules} label="Name" placeholder="Jane Doe" autoComplete="name" />
        <FormField
          control={control}
          name="email"
          rules={emailRules}
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
        />
        <FormField control={control} name="password" rules={passwordRules} label="Password" placeholder="••••••••" secureTextEntry autoComplete="new-password" />
        <FormField
          control={control}
          name="confirmPassword"
          rules={confirmPasswordRules(() => getValues('password'))}
          label="Confirm password"
          placeholder="••••••••"
          secureTextEntry
          autoComplete="new-password"
        />

        <Button title="Sign up" onPress={handleSubmit(onSubmit)} loading={register.isPending} />

        <div className="mt-6 flex flex-row justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Already have an account? </span>
          <Link to="/login" className="text-sm font-semibold text-primary-600">
            Log in
          </Link>
        </div>
      </div>
    </Screen>
  );
}
