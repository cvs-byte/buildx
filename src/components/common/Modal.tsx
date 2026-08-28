import React, { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ag-modal-overlay" onClick={onClose}>
      <div
        className={`ag-modal-content ag-modal-${maxWidth}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ag-modal-header">
          <div>
            <h3 className="ag-modal-title">{title}</h3>
            {subtitle && <p className="ag-modal-subtitle">{subtitle}</p>}
          </div>
          <button className="ag-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>
        <div className="ag-modal-body">{children}</div>
      </div>
    </div>
  );
};
