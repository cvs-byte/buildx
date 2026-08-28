import React, { type ReactNode } from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  variant?: 'blue' | 'purple' | 'emerald' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  variant = 'blue',
}) => {
  return (
    <div className={`ag-stat-card ag-stat-${variant}`}>
      <div className="ag-stat-header">
        <div>
          <span className="ag-stat-title">{title}</span>
          <h3 className="ag-stat-value">{value}</h3>
        </div>
        <div className="ag-stat-icon-wrapper">{icon}</div>
      </div>
      {(trend || subtitle) && (
        <div className="ag-stat-footer">
          {trend && (
            <span className={`ag-stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
              {trend.isPositive ? '▲' : '▼'} {trend.value}
            </span>
          )}
          {subtitle && <span className="ag-stat-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
