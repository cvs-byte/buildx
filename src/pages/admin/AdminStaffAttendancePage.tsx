import React from 'react';
import { DashboardAttendance } from '../../components/DashboardAttendance';

export const AdminStaffAttendancePage: React.FC = () => {
  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Staff & Faculty Attendance Management</h1>
          <p className="ag-page-subtitle">
            Admin oversight: Manage present and absent attendance records for all staff, teachers, and students.
          </p>
        </div>
      </div>

      <DashboardAttendance />
    </div>
  );
};
