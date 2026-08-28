import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="ag-error-page">
      <div className="ag-error-card">
        <div className="ag-error-icon info">
          <Compass size={48} />
        </div>
        <h2>404 - Page Not Found</h2>
        <p className="ag-error-message">
          The page or endpoint route you requested does not exist in AcademyGrowth.
        </p>
        <Button leftIcon={<ArrowLeft size={18} />} onClick={() => navigate('/')}>
          Return to Portal
        </Button>
      </div>
    </div>
  );
};
