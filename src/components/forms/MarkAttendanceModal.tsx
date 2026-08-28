import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { attendanceApi } from '../../api/attendance.api';
import { useToast } from '../../hooks/useToast';
import type { ClassOptionModel, SectionModel } from '../../types/attendance.types';
import { UserCheck, UserX, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface RosterItem {
  id: string;
  name: string;
  rollNumber: string;
  status: AttendanceStatus;
}

export interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultClassName?: string;
}

export const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultClassName = 'class-10',
}) => {
  const { showToast } = useToast();
  const [classes, setClasses] = useState<ClassOptionModel[]>([]);
  const [sections, setSections] = useState<SectionModel[]>([]);
  const [selectedClass, setSelectedClass] = useState(defaultClassName);
  const [selectedSection, setSelectedSection] = useState('A');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  const [roster, setRoster] = useState<RosterItem[]>([]);

  // Load real available classes and sections for current tenant
  useEffect(() => {
    if (isOpen) {
      const loadMetadata = async () => {
        const classList = await attendanceApi.getClasses();
        setClasses(classList);
        if (classList.length > 0 && !selectedClass) {
          setSelectedClass(classList[0].id);
        }
        const secList = await attendanceApi.getSections(selectedClass);
        setSections(secList);
      };
      loadMetadata();
    }
  }, [isOpen, selectedClass]);

  // Load real student roster from canonical database source (GET /students)
  useEffect(() => {
    if (isOpen && selectedClass) {
      const loadRoster = async () => {
        setIsLoadingRoster(true);
        try {
          const students = await attendanceApi.getStudents({
            classId: selectedClass,
            sectionId: selectedSection,
          });

          setRoster(
            students.map((s, idx) => ({
              id: s.userId || s.id,
              name: s.name || `${s.firstName} ${s.lastName}`.trim(),
              rollNumber: s.rollNumber || `CS-2026-${(idx + 1).toString().padStart(3, '0')}`,
              status: 'PRESENT',
            }))
          );
        } finally {
          setIsLoadingRoster(false);
        }
      };
      loadRoster();
    }
  }, [isOpen, selectedClass, selectedSection]);

  const handleToggleStatus = (id: string, newStatus: AttendanceStatus) => {
    setRoster((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await attendanceApi.submitBulkAttendance({
        classId: selectedClass,
        sectionId: selectedSection,
        date: attendanceDate,
        records: roster.map((r) => ({
          studentId: r.id,
          status: r.status,
        })),
      });

      showToast('success', `Roster attendance for ${selectedClass} saved via POST /attendance/bulk!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to submit attendance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Roster Attendance Management"
      subtitle="Record present, absent, or late status for canonical student lists."
      maxWidth="lg"
    >
      <form onSubmit={handleSaveAttendance} className="ag-form-stack space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Class Group"
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          />
          <Select
            label="Section"
            options={sections.map((s) => ({ value: s.name, label: s.name }))}
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          />
          <Input
            label="Attendance Date"
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            required
          />
        </div>

        <div className="ag-attendance-roster-table border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="ag-roster-header-bar bg-slate-50 dark:bg-slate-900 p-3 text-xs font-semibold text-slate-600 dark:text-slate-300 flex justify-between">
            <span>Student Roster ({roster.length})</span>
            <span>Attendance Status Selection</span>
          </div>

          <div className="ag-roster-rows divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
            {isLoadingRoster ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading student roster from database...</div>
            ) : roster.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No students enrolled in this class section.</div>
            ) : (
              roster.map((student) => (
                <div key={student.id} className="ag-roster-item-row p-3 flex justify-between items-center hover:bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">{student.name}</span>
                      <span className="block text-[10px] text-slate-400">{student.rollNumber}</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 border transition-colors ${
                        student.status === 'PRESENT'
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                      onClick={() => handleToggleStatus(student.id, 'PRESENT')}
                    >
                      <UserCheck size={12} /> Present
                    </button>
                    <button
                      type="button"
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 border transition-colors ${
                        student.status === 'ABSENT'
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                      onClick={() => handleToggleStatus(student.id, 'ABSENT')}
                    >
                      <UserX size={12} /> Absent
                    </button>
                    <button
                      type="button"
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 border transition-colors ${
                        student.status === 'LATE'
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                      onClick={() => handleToggleStatus(student.id, 'LATE')}
                    >
                      <Clock size={12} /> Late
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" leftIcon={<CheckCircle2 size={16} />} isLoading={isSubmitting}>
            Save Bulk Attendance
          </Button>
        </div>
      </form>
    </Modal>
  );
};
