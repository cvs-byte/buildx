import React, { type ReactNode } from 'react';

export interface BadgeProps {
  variant?:
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'
    | 'purple'
    | 'blue'
    | 'emerald'
    | 'amber';
  children: ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className = '' }) => {
  return <span className={`ag-badge ag-badge-${variant} ${className}`}>{children}</span>;
};
