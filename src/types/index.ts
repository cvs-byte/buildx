export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ACCOUNTANT';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  education?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface Student {
  id: string;
  userId?: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  className: string;
  section: string;
  parentId?: string;
  parentName?: string;
  guardianContact?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedDate: string;
}

export interface Teacher {
  id: string;
  userId?: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualification: string;
  subjects: string[];
  assignedClasses: string[];
  status: 'active' | 'on_leave' | 'inactive';
  joinedDate: string;
}

export interface Parent {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation?: string;
  linkedStudents: { studentId: string; name: string; className: string }[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ClassModel {
  id: string;
  name: string;
  section: string;
  classTeacherId?: string;
  classTeacherName?: string;
  totalStudents: number;
  subjects: string[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  section: string;
  date: string;
  subject?: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export interface ResultRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  section: string;
  examTitle: string;
  term: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
  status: 'draft' | 'submitted' | 'published';
}

export interface ExamModel {
  id: string;
  title: string;
  academicYear: string;
  term: string;
  startDate: string;
  endDate: string;
  targetClasses: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface FeeStructure {
  id: string;
  title: string;
  academicYear: string;
  className: string;
  tuitionFee: number;
  transportFee: number;
  hostelFee: number;
  otherFee: number;
  totalAmount: number;
  dueDate: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  feeStructureId?: string;
  feeType: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  paymentMethod?: string;
  transactionRef?: string;
  paidAt?: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  receiptNumber?: string;
}

export interface EventModel {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  audience: 'all' | 'students' | 'teachers' | 'parents' | 'class';
  status: 'draft' | 'published' | 'completed' | 'cancelled';
}

export interface NoticeModel {
  id: string;
  title: string;
  content: string;
  audience: 'all' | 'students' | 'teachers' | 'parents';
  priority: 'normal' | 'important' | 'urgent';
  publishDate: string;
  expiryDate?: string;
  status: 'draft' | 'published' | 'archived';
  readByCount?: number;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  category: 'attendance' | 'results' | 'fees' | 'events' | 'notices' | 'system';
  read: boolean;
  createdAt: string;
}

export interface ReportModel {
  id: string;
  title: string;
  category: 'attendance' | 'results' | 'fees' | 'student' | 'teacher' | 'event';
  generatedAt: string;
  format: 'PDF' | 'CSV';
  downloadUrl?: string;
}

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  userEmail: string;
  role: UserRole;
  action: string;
  resource: string;
  status: 'success' | 'failed';
  ipAddress: string;
}
