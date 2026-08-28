import { attendanceApi } from '../api/attendance.api';
import type { AttendanceRecord } from '../types';

export interface AttendanceSummary {
  overallPercentage: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  monthlyData: { month: string; percentage: number }[];
  subjectData: { subject: string; percentage: number }[];
}

export const attendanceService = {
  async getStudentAttendance(studentId?: string, month?: string): Promise<{ records: AttendanceRecord[]; summary: AttendanceSummary | null }> {
    try {
      const currentStudentId = studentId || 'std_current';
      const result = await attendanceApi.getStudentAttendance(currentStudentId, { startDate: month });
      
      const summaryStats = result.summary;
      const monthlyData = [
        { month: 'Jan', percentage: 92 },
        { month: 'Feb', percentage: 94 },
        { month: 'Mar', percentage: summaryStats.attendancePercentage || 90 },
      ];
      const subjectData = [
        { subject: 'Mathematics', percentage: 95 },
        { subject: 'Science', percentage: 88 },
        { subject: 'Computer Science', percentage: 96 },
        { subject: 'English', percentage: 90 },
      ];

      const records: AttendanceRecord[] = result.records.map((r) => ({
        id: r.id,
        studentId: r.userId,
        studentName: r.userName,
        rollNumber: r.userId.slice(-6).toUpperCase(),
        className: r.className || 'Class 10',
        section: r.department || 'A',
        date: r.date,
        status: r.status === 'ON_LEAVE' ? 'present' : (r.status.toLowerCase() as 'present' | 'absent' | 'late'),
        remarks: r.remarks,
      }));

      return {
        records,
        summary: {
          overallPercentage: summaryStats.attendancePercentage,
          totalPresent: summaryStats.present,
          totalAbsent: summaryStats.absent,
          totalLate: summaryStats.late,
          monthlyData,
          subjectData,
        },
      };
    } catch {
      return { records: [], summary: null };
    }
  },

  async saveTeacherAttendance(classId: string, date: string, subject: string, records: { studentId: string; status: 'present' | 'absent' | 'late' }[]): Promise<void> {
    await attendanceApi.submitBulkAttendance({
      classId,
      sectionId: 'A',
      date,
      records: records.map((r) => ({
        studentId: r.studentId,
        status: r.status.toUpperCase() as 'PRESENT' | 'ABSENT' | 'LATE',
        remarks: `Subject: ${subject}`,
      })),
    });
  }
};
