export interface ResultRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  section: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  status: 'PASS' | 'FAIL' | 'DISTINCTION';
  examName: string;
  examDate: string;
}

export interface ResultsFilter {
  className?: string;
  subject?: string;
  status?: string;
  searchTerm?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  role: 'TEACHER' | 'STUDENT';
  className?: string;
  department?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_LEAVE';
  checkInTime?: string;
  remarks?: string;
}

export interface AttendanceSummary {
  totalUsers: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  onLeaveCount: number;
  presentPercentage: number;
}

export interface ScheduledClass {
  id: string;
  subject: string;
  subjectCode: string;
  className: string;
  roomNumber: string;
  startTime: string;
  endTime: string;
  teacherName: string;
  teacherId: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  presentStudentList: { id: string; name: string; rollNumber: string }[];
  absentStudentList: { id: string; name: string; rollNumber: string }[];
}
