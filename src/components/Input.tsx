import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';
import './Input.css';

interface BaseInputProps {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  suffix?: React.ReactNode;
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
    suffix,
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

  const inputClasses = ['input', multiline && 'input--multiline', suffix && 'input--with-suffix']
    .filter(Boolean)
    .join(' ');

  const renderInput = () => {
    if (multiline) {
      return (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }
    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        id={inputId}
        className={inputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...(rest as InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  };

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
        </label>
      )}

      {suffix ? (
        <div className="input__field-wrapper">
          {renderInput()}
          <div className="input__suffix">{suffix}</div>
        </div>
      ) : (
        renderInput()
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
