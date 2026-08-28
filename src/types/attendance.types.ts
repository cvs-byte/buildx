import type { AttendanceRecord } from './dashboard.types';
import type { User } from './user.types';

export type QRSessionStatus = 'ACTIVE' | 'CLOSED' | 'EXPIRED';

export interface QRSession {
  sessionId: string;
  tenantId: string;
  schoolId: string;
  academicYearId?: string;
  classId: string;
  sectionId: string;
  periodId?: string;
  token: string;
  expiresAt: string;
  status: QRSessionStatus;
  createdBy: string;
  createdAt: string;
  presentCount?: number;
  totalStudents?: number;
}

export interface QRGenerationPayload {
  classId: string;
  sectionId: string;
  periodId?: string;
  date?: string;
  academicYearId?: string;
}

export interface QRGenerationResponse {
  success: boolean;
  sessionId: string;
  token: string;
  expiresAt: string;
  classId: string;
  sectionId: string;
  qrData?: string;
  message?: string;
}

export interface QRValidatePayload {
  token: string;
}

export type ScanResultCode =
  | 'PRESENT'
  | 'ALREADY_RECORDED'
  | 'EXPIRED'
  | 'WRONG_CLASS'
  | 'INVALID_TOKEN'
  | 'UNAUTHORIZED'
  | 'USER_NOT_FOUND';

export interface QRValidateResponse {
  success: boolean;
  status: ScanResultCode;
  message: string;
  markedAt?: string;
  className?: string;
  section?: string;
  studentId?: string;
  studentName?: string;
  record?: AttendanceRecord;
}

export interface StudentQRVerificationResult {
  success: boolean;
  status: ScanResultCode;
  message: string;
  student?: User;
  markedAt?: string;
  record?: AttendanceRecord;
}

export interface BulkAttendanceRecordDTO {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface BulkAttendancePayload {
  classId: string;
  sectionId: string;
  date: string;
  academicYear?: string;
  records: BulkAttendanceRecordDTO[];
}

export interface AttendanceQueryFilters {
  date?: string;
  startDate?: string;
  endDate?: string;
  classId?: string;
  sectionId?: string;
  studentId?: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | string;
  academicYear?: string;
  tenantId?: string;
  page?: number;
  pageSize?: number;
  nextToken?: string | null;
  search?: string;
}

export interface AttendanceSummaryStats {
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendancePercentage: number;
  date?: string;
  classId?: string;
  sectionId?: string;
}

export interface SectionModel {
  id: string;
  name: string;
  classId: string;
  tenantId?: string;
  studentCount?: number;
}

export interface ClassOptionModel {
  id: string;
  name: string;
  gradeLevel?: string;
  tenantId?: string;
  sections?: SectionModel[];
}
