import { useState, type FormEvent } from 'react';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../components/AuthProvider';
import { TextField } from '../components/TextField';
import { ApiError } from '../services/apiClient';
import { describeError } from '../utils/errorMessages';
import { validateRegistration, type ValidationErrors } from '../utils/validation';

export function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validateRegistration({ email, password, confirmPassword });
    setErrors(validationErrors);
    setFormError(null);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await register({ email: email.trim(), password, confirmPassword });
    } catch (error) {
      setFormError(describeError(error instanceof ApiError ? error.code : null));
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Guarda tus listas y preferencias. Tus canciones nunca salen de tu dispositivo."
      footerText="¿Ya tienes cuenta?"
      footerLinkLabel="Inicia sesión"
      footerLinkTo="/login"
    >
      <form onSubmit={handleSubmit} noValidate>
        <TextField id="email" label="Correo electrónico" type="email" value={email} autoComplete="email" errorCode={errors.email} onChange={setEmail} />
        <TextField id="password" label="Contraseña (mínimo 8 caracteres)" type="password" value={password} autoComplete="new-password" errorCode={errors.password} onChange={setPassword} />
        <TextField id="confirm-password" label="Confirmar contraseña" type="password" value={confirmPassword} autoComplete="new-password" errorCode={errors.confirmPassword} onChange={setConfirmPassword} />
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="button button--primary button--block" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthLayout>
  );
}
