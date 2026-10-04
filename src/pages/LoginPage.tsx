import { useState, type FormEvent } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../components/AuthProvider';
import { TextField } from '../components/TextField';
import { ApiError } from '../services/apiClient';
import { describeError } from '../utils/errorMessages';
import { validateLogin, type ValidationErrors } from '../utils/validation';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validateLogin(email, password);
    setErrors(validationErrors);
    setFormError(null);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (error) {
      setFormError(describeError(error instanceof ApiError ? error.code : null));
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Inicia sesión"
      subtitle="Entra a tu biblioteca para escuchar la música de tu dispositivo."
      footerText="¿No tienes cuenta?"
      footerLinkLabel="Regístrate"
      footerLinkTo="/register"
    >
      <form onSubmit={handleSubmit} noValidate>
        <TextField id="email" label="Correo electrónico" type="email" value={email} autoComplete="email" errorCode={errors.email} onChange={setEmail} />
        <TextField id="password" label="Contraseña" type="password" value={password} autoComplete="current-password" errorCode={errors.password} onChange={setPassword} />
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="button button--primary button--block" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
    </AuthLayout>
  );
}
