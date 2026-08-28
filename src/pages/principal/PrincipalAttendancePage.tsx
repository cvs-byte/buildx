import React from 'react';
import { DashboardAttendance } from '../../components/DashboardAttendance';

export const PrincipalAttendancePage: React.FC = () => {
  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">School Attendance Management</h1>
          <p className="ag-page-subtitle">
            Principal portal: View school attendance metrics and mark attendance for assigned classes.
          </p>
        </div>
      </div>

      <DashboardAttendance />
    </div>
  );
};
