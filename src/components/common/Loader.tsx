import React from 'react';

export const Loader: React.FC<{ fullScreen?: boolean; message?: string }> = ({
  fullScreen = false,
  message = 'Loading AcademyGrowth...',
}) => {
  if (fullScreen) {
    return (
      <div className="ag-loader-fullscreen">
        <div className="ag-loader-card">
          <div className="ag-spinner-lg"></div>
          <p className="ag-loader-text">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ag-loader-inline">
      <div className="ag-spinner"></div>
      {message && <span className="ag-loader-text">{message}</span>}
    </div>
  );
};
