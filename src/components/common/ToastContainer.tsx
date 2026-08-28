import React from 'react';
import { useToast } from '../../hooks/useToast';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="toast-icon-success" />;
      case 'error':
        return <AlertCircle size={18} className="toast-icon-error" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon-warning" />;
      default:
        return <Info size={18} className="toast-icon-info" />;
    }
  };

  return (
    <div className="ag-toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`ag-toast ag-toast-${toast.type}`}>
          <div className="ag-toast-content">
            {renderIcon(toast.type)}
            <span>{toast.message}</span>
          </div>
          <button className="ag-toast-close" onClick={() => removeToast(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
