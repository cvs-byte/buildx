import React, { useState } from 'react';
import { AttendanceDashboardPage } from '../pages/dashboards/AttendanceDashboardPage';
import { Button } from './common/Button';
import { MarkAttendanceModal } from './forms/MarkAttendanceModal';
import { TeacherQRScannerModal } from './qr/TeacherQRScannerModal';
import { UserCheck, Camera } from 'lucide-react';

/**
 * Modular DashboardAttendance component
 * Embedded into College Admin, Principal, Teacher, and Admin portals with QR Camera Scanner & Roster triggers.
 */
export const DashboardAttendance: React.FC = () => {
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  return (
    <div className="ag-modular-dashboard space-y-4">
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '-2rem', zIndex: 10, position: 'relative' }}>
        <Button
          variant="outline"
          leftIcon={<UserCheck size={16} />}
          onClick={() => setIsMarkModalOpen(true)}
        >
          Manual Roster Entry
        </Button>
        <Button
          variant="primary"
          leftIcon={<Camera size={16} />}
          onClick={() => setIsScannerModalOpen(true)}
        >
          Start Camera Scanner
        </Button>
      </div>

      <AttendanceDashboardPage />

      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
      />

      <TeacherQRScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        selectedClass="class-10"
        selectedSection="A"
      />
    </div>
  );
};

export default DashboardAttendance;
