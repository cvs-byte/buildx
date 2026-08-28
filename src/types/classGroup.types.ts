export interface ClassGroup {
  id: string;
  name: string; // e.g. "Class A - Computer Science", "Class B - Science"
  code: string; // e.g. "CLS-A-CS"
  academicYear: string; // e.g. "2026-2027"
  gradeLevel: string;
  section: string;
  capacity: number;
  enrolledCount: number;
  tenantId: string;
  createdAt: string;
}

export interface CreateClassGroupDTO {
  name: string;
  code: string;
  academicYear: string;
  gradeLevel: string;
  section: string;
  capacity?: number;
  tenantId: string;
}

export interface AssignStudentDTO {
  classGroupId: string;
  studentId: string;
}
