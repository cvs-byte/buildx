import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, type, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const computedRightIcon =
      rightIcon ||
      (isPassword ? (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
          title={showPassword ? 'Hide password' : 'Show password'}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: 'var(--text-muted, #94a3b8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      ) : undefined);

    return (
      <div className="ag-form-group">
        {label && (
          <label htmlFor={inputId} className="ag-form-label">
            {label} {props.required && <span className="ag-required">*</span>}
          </label>
        )}
        <div className={`ag-input-wrapper ${error ? 'ag-input-error' : ''}`}>
          {leftIcon && <span className="ag-input-icon-left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            type={computedType}
            className={`ag-input ${leftIcon ? 'has-left-icon' : ''} ${computedRightIcon ? 'has-right-icon' : ''} ${className}`}
            {...props}
          />
          {computedRightIcon && <span className="ag-input-icon-right">{computedRightIcon}</span>}
        </div>
        {error && <span className="ag-error-text">{error}</span>}
        {!error && helperText && <span className="ag-helper-text">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
