import React, { useState, useEffect } from 'react';
import { leaveApi } from '../../api/leave.api';
import type { LeaveRequest } from '../../types/leave.types';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';

export const AdminLeaveManagementPage: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { showToast } = useToast();

  const loadLeaves = async () => {
    setIsLoading(true);
    try {
      const data = await leaveApi.getLeaveRequests();
      setLeaves(data);
    } catch {
      showToast('error', 'Failed to load leave requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const updated = await leaveApi.approveLeave(id, 'Approved by System Admin');
      setLeaves((prev) => prev.map((l) => (l.id === id ? updated : l)));
      showToast('success', `Leave request for ${updated.userName} approved.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to approve leave.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const updated = await leaveApi.rejectLeave(id, 'Declined due to scheduling requirements');
      setLeaves((prev) => prev.map((l) => (l.id === id ? updated : l)));
      showToast('success', `Leave request for ${updated.userName} declined.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to decline leave.');
    }
  };

  const filteredLeaves = leaves.filter((l) =>
    statusFilter === 'ALL' ? true : l.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">APPROVED</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      default:
        return <Badge variant="warning">PENDING REVIEW</Badge>;
    }
  };

  const columns: Column<LeaveRequest>[] = [
    {
      header: 'Applicant',
      accessor: (row) => (
        <div className="ag-user-cell">
          <div className="ag-cell-avatar">{row.userName.charAt(0)}</div>
          <div>
            <span className="ag-cell-name">{row.userName}</span>
            <Badge variant="neutral">{row.userRole}</Badge>
          </div>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      accessor: (row) => <span className="ag-leave-type">{row.leaveType} LEAVE</span>,
    },
    {
      header: 'Duration',
      accessor: (row) => (
        <div className="ag-department-cell">
          <Calendar size={14} />
          <span>
            {formatDate(row.startDate)} to {formatDate(row.endDate)} ({row.totalDays} Days)
          </span>
        </div>
      ),
    },
    {
      header: 'Reason',
      accessor: (row) => <span className="ag-leave-reason">{row.reason}</span>,
    },
    {
      header: 'Applied On',
      accessor: (row) => formatDate(row.appliedOn),
    },
    {
      header: 'Status',
      accessor: (row) => getStatusBadge(row.status),
    },
    {
      header: 'Actions',
      accessor: (row) =>
        row.status === 'PENDING' ? (
          <div className="ag-action-group">
            <button
              className="ag-action-btn-success"
              onClick={() => handleApprove(row.id)}
              title="Approve Leave"
            >
              <CheckCircle2 size={16} />
            </button>
            <button
              className="ag-action-btn-danger"
              onClick={() => handleReject(row.id)}
              title="Reject Leave"
            >
              <XCircle size={16} />
            </button>
          </div>
        ) : (
          <span className="ag-text-muted">{row.reviewRemarks || 'Processed'}</span>
        ),
    },
  ];

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Admin Leave Management</h1>
          <p className="ag-page-subtitle">
            Review, approve, or reject leave applications submitted by school Principals, Teachers, and Staff.
          </p>
        </div>
        <div className="ag-filter-bar">
          <button
            className={`ag-filter-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All Requests
          </button>
          <button
            className={`ag-filter-pill ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending
          </button>
          <button
            className={`ag-filter-pill ${statusFilter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('APPROVED')}
          >
            Approved
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredLeaves}
        keyExtractor={(l) => l.id}
        isLoading={isLoading}
        emptyMessage="No leave applications found."
      />
    </div>
  );
};
