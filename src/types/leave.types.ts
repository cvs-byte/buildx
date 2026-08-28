export type LeaveType = 'SICK' | 'CASUAL' | 'MATERNITY' | 'DUTY' | 'EMERGENCY';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: 'PRINCIPAL' | 'TEACHER' | 'STUDENT';
  tenantId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewRemarks?: string;
}

export interface CreateLeaveDTO {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}
