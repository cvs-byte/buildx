import React from 'react';

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1.25rem',
  borderRadius = '6px',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`ag-skeleton-anim ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e2e8f0',
        opacity: 0.7,
        animation: 'pulse 1.5s infinite ease-in-out',
        ...style,
      }}
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="ag-skeleton-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="ag-card" style={{ padding: '1.5rem', height: '120px' }}>
            <SkeletonLoader width="40%" height="1rem" />
            <SkeletonLoader width="60%" height="2rem" style={{ marginTop: '0.75rem' }} />
          </div>
        ))}
      </div>
      <div className="ag-card" style={{ padding: '1.5rem', height: '300px' }}>
        <SkeletonLoader width="30%" height="1.5rem" />
        <SkeletonLoader width="100%" height="200px" style={{ marginTop: '1rem' }} />
      </div>
    </div>
  );
};
