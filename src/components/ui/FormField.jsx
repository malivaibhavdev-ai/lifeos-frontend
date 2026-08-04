import { Controller } from 'react-hook-form';

export function FormField({
  control,
  name,
  rules,
  label,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoComplete,
}) {
  const inputType = secureTextEntry ? 'password' : keyboardType === 'email-address' ? 'email' : 'text';

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <div className="mb-4">
          {label ? <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label> : null}
          <input
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            type={inputType}
            autoComplete={autoComplete}
            className={`h-12 w-full rounded-xl border px-4 text-base text-gray-900 dark:text-white bg-transparent outline-none focus:border-primary-600 ${
              error ? 'border-danger' : 'border-gray-300 dark:border-gray-700'
            }`}
          />
          {error ? <p className="mt-1 text-xs text-danger">{error.message}</p> : null}
        </div>
      )}
    />
  );
}
