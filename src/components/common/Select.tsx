import { forwardRef, type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="ag-form-group">
        {label && (
          <label htmlFor={selectId} className="ag-form-label">
            {label} {props.required && <span className="ag-required">*</span>}
          </label>
        )}
        <div className={`ag-select-wrapper ${error ? 'ag-input-error' : ''}`}>
          <select ref={ref} id={selectId} className={`ag-select ${className}`} {...props}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && <span className="ag-error-text">{error}</span>}
        {!error && helperText && <span className="ag-helper-text">{helperText}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
