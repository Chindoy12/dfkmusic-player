import { describeError } from '../utils/errorMessages';

interface TextFieldProps {
  id: string;
  label: string;
  type: 'email' | 'password';
  value: string;
  autoComplete: string;
  errorCode?: string;
  onChange: (value: string) => void;
}

export function TextField({ id, label, type, value, autoComplete, errorCode, onChange }: TextFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={errorCode ? true : undefined}
        aria-describedby={errorCode ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {errorCode && (
        <p id={errorId} className="field__error">
          {describeError(errorCode)}
        </p>
      )}
    </div>
  );
}
