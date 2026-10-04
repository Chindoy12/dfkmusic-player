export interface RegistrationInput {
  email: string;
  password: string;
  confirmPassword: string;
}

export type ValidationErrors = Partial<Record<keyof RegistrationInput, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'EMAIL_REQUIRED';
  if (!EMAIL_PATTERN.test(email.trim())) return 'EMAIL_INVALID';
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'PASSWORD_REQUIRED';
  if (password.length < MIN_PASSWORD_LENGTH) return 'PASSWORD_TOO_SHORT';
}

export function validateLogin(email: string, password: string): ValidationErrors {
  const errors: ValidationErrors = {};
  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;
  if (!password) errors.password = 'PASSWORD_REQUIRED';
  return errors;
}

export function validateRegistration(input: RegistrationInput): ValidationErrors {
  const errors: ValidationErrors = {};
  const emailError = validateEmail(input.email);
  const passwordError = validatePassword(input.password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (!input.confirmPassword) errors.confirmPassword = 'CONFIRM_REQUIRED';
  else if (input.password !== input.confirmPassword) errors.confirmPassword = 'PASSWORDS_DO_NOT_MATCH';
  return errors;
}
