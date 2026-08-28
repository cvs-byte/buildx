import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClass = 'ag-btn';
  const variantClass = `ag-btn-${variant}`;
  const sizeClass = `ag-btn-${size}`;

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="ag-btn-spinner"></span>
      ) : (
        <>
          {leftIcon && <span className="ag-btn-icon-left">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="ag-btn-icon-right">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
