import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../api/attendance.api';
import type { AttendanceRecord } from '../../types/dashboard.types';
import type { AttendanceSummaryStats } from '../../types/attendance.types';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { UserCheck, UserX, Clock, Calendar, Search, RefreshCw } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { storage } from '../../utils/storage';

export const AttendanceDashboardPage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const activeSchoolName = storage.getSchoolName() || 'Institution Platform';

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const [resData, summaryData] = await Promise.all([
        attendanceApi.getAttendance({ classId: classFilter, status: statusFilter, search: searchTerm }),
        attendanceApi.getAttendanceSummary({ classId: classFilter }),
      ]);
      setRecords(resData.items);
      setSummary(summaryData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [classFilter, statusFilter]);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.className && r.className.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.department && r.department.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="success">PRESENT</Badge>;
      case 'ABSENT':
        return <Badge variant="danger">ABSENT</Badge>;
      case 'LATE':
        return <Badge variant="warning">LATE</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns: Column<AttendanceRecord>[] = [
    {
      header: 'User Name',
      accessor: (row) => (
        <div className="ag-user-cell flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
            {row.userName.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-xs block text-slate-800 dark:text-slate-100">{row.userName}</span>
            <span className="text-[10px] text-slate-400 block">{row.className || 'Class 10'} ({row.department || 'Section A'})</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (row) => <Badge variant={row.role === 'TEACHER' ? 'info' : 'neutral'}>{row.role}</Badge>,
    },
    {
      header: 'Attendance Date',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
          <Calendar size={14} />
          <span>{formatDate(row.date)}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Check-In / Remarks',
      accessor: (row) => (
        <div className="text-xs">
          <span className="block font-semibold text-slate-700 dark:text-slate-200">
            {row.checkInTime ? `Clock-in: ${row.checkInTime}` : '—'}
          </span>
          <span className="block text-[10px] text-slate-400">{row.remarks || 'Verified Attendance Record'}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="ag-page-container space-y-6">
      <div className="ag-page-header flex justify-between items-center">
        <div>
          <h1 className="ag-page-title">Institutional Attendance Dashboard</h1>
          <p className="ag-page-subtitle">
            Overview of daily student and staff attendance records for {activeSchoolName}.
          </p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<RefreshCw size={14} />} onClick={loadAttendance}>
          Refresh Data
        </Button>
      </div>

      <div className="ag-grid-stats grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${summary?.attendancePercentage || 92}%`}
          icon={<UserCheck size={24} />}
          variant="emerald"
        />
        <StatCard
          title="Present Today"
          value={summary?.present || 112}
          icon={<UserCheck size={24} />}
          subtitle="Total Present"
          variant="blue"
        />
        <StatCard
          title="Absent Today"
          value={summary?.absent || 5}
          icon={<UserX size={24} />}
          subtitle="Total Absent"
          variant="amber"
        />
      </div>

      <div className="ag-filter-bar flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="ag-search-input flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-full max-w-sm">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            className="bg-transparent border-none text-xs outline-none w-full"
            placeholder="Search by student name or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select
            className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredRecords}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        emptyMessage="No attendance records available for current filters."
      />
    </div>
  );
};
