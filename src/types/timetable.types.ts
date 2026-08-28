export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export interface TimetableEntry {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  subjectCode: string;
  className: string; // e.g. "Class A", "Grade 11 - Section A"
  roomNumber: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "10:30 AM"
  tenantId: string;
  createdAt: string;
}

export interface CreateTimetableDTO {
  teacherId: string;
  teacherName: string;
  subject: string;
  subjectCode: string;
  className: string;
  roomNumber: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  tenantId: string;
}
