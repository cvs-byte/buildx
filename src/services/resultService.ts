import { ResultRecord, ExamModel } from '../types';
import { apiClient } from './apiClient';

export const resultService = {
  async getStudentResults(studentId?: string, term?: string): Promise<ResultRecord[]> {
    try {
      return await apiClient.get<ResultRecord[]>(`/results/student${studentId ? `?studentId=${studentId}` : ''}`);
    } catch {
      return [];
    }
  },

  async submitTeacherResults(classId: string, examId: string, subject: string, results: { studentId: string; marks: number; grade: string; remarks?: string }[]): Promise<void> {
    await apiClient.post('/results/submit', { classId, examId, subject, results });
  },

  async getExams(): Promise<ExamModel[]> {
    try {
      return await apiClient.get<ExamModel[]>('/exams');
    } catch {
      return [];
    }
  }
};
