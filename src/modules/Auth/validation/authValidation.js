const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const nameRules = {
  required: 'Name is required',
  minLength: { value: 2, message: 'Name must be at least 2 characters' },
};

export const emailRules = {
  required: 'Email is required',
  pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
};

export const passwordRules = {
  required: 'Password is required',
  minLength: { value: 8, message: 'Password must be at least 8 characters' },
  pattern: { value: /\d/, message: 'Password must contain a number' },
};

// Login only checks presence — the backend re-validates strength on register/reset.
export const loginPasswordRules = {
  required: 'Password is required',
};

export const confirmPasswordRules = (getPassword) => ({
  required: 'Please confirm your password',
  validate: (value) => value === getPassword() || 'Passwords do not match',
});
