import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';
import './Input.css';

interface BaseInputProps {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export interface InputProps
  extends BaseInputProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  multiline?: false;
}

export interface TextareaProps
  extends BaseInputProps,
    TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true;
}

type CombinedProps = InputProps | TextareaProps;

export const Input = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  CombinedProps
>((props, ref) => {
  const {
    label,
    error,
    hint,
    fullWidth = false,
    className = '',
    multiline,
    id,
    ...rest
  } = props;

  const generatedId = useId();
  const inputId = id || generatedId;

  const wrapperClasses = [
    'input-wrapper',
    fullWidth && 'input-wrapper--full-width',
    error && 'input-wrapper--error',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inputClasses = ['input', multiline && 'input--multiline']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
        </label>
      )}

      {multiline ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}

      {error && (
        <span id={`${inputId}-error`} className="input__error" role="alert">
          {error}
        </span>
      )}

      {hint && !error && (
        <span id={`${inputId}-hint`} className="input__hint">
          {hint}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
