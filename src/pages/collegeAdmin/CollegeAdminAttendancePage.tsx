import React from 'react';
import { DashboardAttendance } from '../../components/DashboardAttendance';

export const CollegeAdminAttendancePage: React.FC = () => {
  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">College Admin: Attendance Oversight</h1>
          <p className="ag-page-subtitle">
            Oversee staff, teacher, and student attendance statistics across all college departments.
          </p>
        </div>
      </div>

      <DashboardAttendance />
    </div>
  );
};
