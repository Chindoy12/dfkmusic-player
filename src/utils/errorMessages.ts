const MESSAGES: Record<string, string> = {
  EMAIL_REQUIRED: 'Escribe tu correo electrónico.',
  EMAIL_INVALID: 'El correo no tiene un formato válido.',
  PASSWORD_REQUIRED: 'Escribe tu contraseña.',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 8 caracteres.',
  CONFIRM_REQUIRED: 'Confirma tu contraseña.',
  PASSWORDS_DO_NOT_MATCH: 'Las contraseñas no coinciden.',
  EMAIL_TAKEN: 'Ya existe una cuenta con ese correo.',
  INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  NETWORK_ERROR: 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.',
  UNAUTHENTICATED: 'Tu sesión expiró. Inicia sesión de nuevo.',
  AUDIO_LOAD_FAILED: 'Este archivo no se pudo reproducir. Puede que el navegador no soporte su formato.',
  PLAYBACK_FAILED: 'No se pudo iniciar la reproducción. Pulsa play otra vez.',
  STATE_LOAD_FAILED: 'No se pudieron cargar tus listas y preferencias guardadas.',
  STATE_SAVE_FAILED: 'No se pudieron guardar tus cambios en la nube.',
};

export function describeError(code: string | null | undefined): string {
  return (code && MESSAGES[code]) || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}
