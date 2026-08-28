import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { TeacherQRScannerModal } from '../../components/qr/TeacherQRScannerModal';
import { attendanceApi } from '../../api/attendance.api';
import { useToast } from '../../hooks/useToast';
import type { AttendanceRecord } from '../../types/dashboard.types';
import type { ClassOptionModel, SectionModel, StudentQRVerificationResult } from '../../types/attendance.types';
import { Camera, UserCheck, UserX, Search, RefreshCw, CheckCircle2, Save, Users, CheckCheck, XCircle, RotateCcw, ShieldCheck, User as UserIcon } from 'lucide-react';

export type AttendanceStatusType = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'UNMARKED';

export interface RosterStateItem {
  studentId: string;
  name: string;
  rollNumber: string;
  email?: string;
  status: AttendanceStatusType;
  checkInTime?: string;
  source?: 'MANUAL' | 'QR';
}

export const TeacherAttendancePage: React.FC = () => {
  const { showToast } = useToast();
  const [classes, setClasses] = useState<ClassOptionModel[]>([]);
  const [sections, setSections] = useState<SectionModel[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('class-1');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [roster, setRoster] = useState<RosterStateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  // Load class & section metadata
  useEffect(() => {
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
  }, []);

  // Load real student roster from https://api.academygrowth.in/Users
  const loadRosterAndAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const [studentsList, existingAtt] = await Promise.all([
        attendanceApi.getStudents({ classId: selectedClass, sectionId: selectedSection }),
        attendanceApi.getAttendance({ classId: selectedClass, sectionId: selectedSection, date: attendanceDate }),
      ]);

      const attMap = new Map<string, AttendanceRecord>();
      existingAtt.items.forEach((r) => {
        attMap.set(r.userId, r);
      });

      const mappedRoster: RosterStateItem[] = studentsList.map((s, idx) => {
        const existing = attMap.get(s.userId || s.id);
        const existingStatus = existing && existing.status !== ('UNMARKED' as any)
          ? (existing.status === 'ON_LEAVE' ? 'EXCUSED' : (existing.status as AttendanceStatusType))
          : 'UNMARKED';

        return {
          studentId: s.userId || s.id,
          name: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student User',
          rollNumber: s.rollNumber || `CS-2026-${(idx + 1).toString().padStart(3, '0')}`,
          email: s.email,
          status: existingStatus,
          checkInTime: existingStatus === 'PRESENT' ? existing?.checkInTime : undefined,
          source: existing?.remarks?.includes('QR') ? 'QR' : 'MANUAL',
        };
      });
      setRoster(mappedRoster);
    } catch {
      showToast('error', 'Unable to load class roster from Users database.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, selectedSection, attendanceDate, showToast]);

  useEffect(() => {
    loadRosterAndAttendance();
  }, [loadRosterAndAttendance]);

  const handleToggleStatus = (studentId: string, targetStatus: AttendanceStatusType) => {
    setRoster((prev) =>
      prev.map((item) => {
        if (item.studentId !== studentId) return item;
        const newStatus = item.status === targetStatus ? 'UNMARKED' : targetStatus;
        return {
          ...item,
          status: newStatus,
          source: 'MANUAL',
          checkInTime: newStatus === 'PRESENT' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        };
      })
    );
  };

  const handleMarkAllPresent = () => {
    setRoster((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'PRESENT',
        source: 'MANUAL',
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }))
    );
    showToast('success', 'All students marked PRESENT.');
  };

  const handleMarkAllAbsent = () => {
    setRoster((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'ABSENT',
        source: 'MANUAL',
        checkInTime: undefined,
      }))
    );
    showToast('info', 'All students marked ABSENT.');
  };

  const handleClearAll = () => {
    setRoster((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'UNMARKED',
        source: 'MANUAL',
        checkInTime: undefined,
      }))
    );
    showToast('info', 'Attendance selections reset to Pending.');
  };

  const handleSaveBulkAttendance = async () => {
    setIsSaving(true);
    try {
      const recordsToSave = roster
        .filter((r) => r.status !== 'UNMARKED')
        .map((r) => ({
          studentId: r.studentId,
          status: r.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
        }));

      if (recordsToSave.length === 0) {
        showToast('warning', 'Please select Present or Absent for at least one student before saving.');
        setIsSaving(false);
        return;
      }

      await attendanceApi.submitBulkAttendance({
        classId: selectedClass,
        sectionId: selectedSection,
        date: attendanceDate,
        records: recordsToSave,
      });

      showToast('success', `Attendance saved successfully for ${recordsToSave.length} students!`);
      await loadRosterAndAttendance();
    } catch (err: any) {
      showToast('error', err.message || 'Attendance could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQRScanVerified = (result: StudentQRVerificationResult) => {
    if (result.status === 'ALREADY_RECORDED') {
      showToast('error', `Error: Attendance already marked for ${result.student?.name || 'this student'} today.`);
      return;
    }
    if (result.student) {
      const scannedId = result.student.userId || result.student.id;
      const existing = roster.find((r) => r.studentId === scannedId);
      if (existing && existing.status !== 'UNMARKED') {
        showToast('error', `Error: Attendance already marked for ${result.student.name} today.`);
      }
      setRoster((prev) =>
        prev.map((item) =>
          item.studentId === scannedId
            ? {
                ...item,
                status: 'PRESENT',
                source: 'QR',
                checkInTime: result.markedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }
            : item
        )
      );
      loadRosterAndAttendance();
    }
  };

  const filteredRoster = roster.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.email && r.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalCount = roster.length;
  const presentCount = roster.filter((r) => r.status === 'PRESENT').length;
  const absentCount = roster.filter((r) => r.status === 'ABSENT').length;
  const pendingCount = roster.filter((r) => r.status === 'UNMARKED').length;

  return (
    <div className="ag-page-container space-y-6">
      {/* Executive Hero Banner */}
      <div className="ag-hero-gradient p-6 rounded-3xl text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl border border-indigo-500/30">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2">
            <ShieldCheck size={14} />
            <span>Executive Attendance Portal</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">Classroom Attendance System</h1>
          <p className="text-xs text-indigo-200 mt-1 max-w-lg">
            Mark student attendance manually or scan personal student QR passes using camera scanner.
          </p>
        </div>

        {/* Global Batch Action Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            size="sm"
            variant="outline"
            className="bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
            leftIcon={<CheckCheck size={16} />}
            onClick={handleMarkAllPresent}
          >
            Mark All Present
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-rose-500/10 border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
            leftIcon={<XCircle size={16} />}
            onClick={handleMarkAllAbsent}
          >
            Mark All Absent
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            leftIcon={<RotateCcw size={14} />}
            onClick={handleClearAll}
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg border-none"
            leftIcon={<Camera size={16} />}
            onClick={() => setIsScannerModalOpen(true)}
          >
            Open Camera Scanner
          </Button>
        </div>
      </div>

      {/* Class / Section / Date Selector Bar */}
      <div className="ag-glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full sm:w-auto">
          <Select
            label="Class"
            options={classes.map((c) => ({ value: c.id, label: c.name }))}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          />
          <Select
            label="Section"
            options={sections.map((s) => ({ value: s.name, label: `Section ${s.name}` }))}
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          />
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-400 mb-1">Attendance Date</label>
            <input
              type="date"
              className="text-xs border border-slate-700 bg-slate-800 text-white rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" leftIcon={<RefreshCw size={14} />} onClick={loadRosterAndAttendance}>
            Refresh Roster
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Save size={14} />}
            isLoading={isSaving}
            onClick={handleSaveBulkAttendance}
          >
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Real-time Summary Cards */}
      <div className="ag-grid-stats grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students Enrolled"
          value={totalCount}
          icon={<Users size={24} />}
          variant="blue"
        />
        <StatCard
          title="Marked Present"
          value={presentCount}
          subtitle={`${totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}% of roster`}
          icon={<UserCheck size={24} />}
          variant="emerald"
        />
        <StatCard
          title="Marked Absent"
          value={absentCount}
          subtitle={`${totalCount > 0 ? Math.round((absentCount / totalCount) * 100) : 0}% of roster`}
          icon={<UserX size={24} />}
          variant="amber"
        />
        <StatCard
          title="Pending Check-in"
          value={pendingCount}
          subtitle="Awaiting teacher toggle or scan"
          icon={<CheckCircle2 size={24} />}
          variant="purple"
        />
      </div>

      {/* Main Roster Workspace */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="ag-search-input flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 w-full max-w-sm">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              className="bg-transparent border-none text-xs text-white outline-none w-full placeholder-slate-400"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
              onClick={handleMarkAllPresent}
            >
              Mark All Present
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-rose-500/10 border-rose-500/40 text-rose-300"
              onClick={handleMarkAllAbsent}
            >
              Mark All Absent
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save size={14} />}
              isLoading={isSaving}
              onClick={handleSaveBulkAttendance}
            >
              Save Attendance
            </Button>
          </div>
        </div>

        {/* Clean Professional Student Roster Table */}
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
          <div className="bg-slate-800/80 px-4 py-3 text-xs font-bold text-slate-300 flex justify-between items-center border-b border-slate-800">
            <span>STUDENT PROFILE</span>
            <span className="text-right">ATTENDANCE STATUS TOGGLE</span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading student roster from https://api.academygrowth.in/Users...</div>
            ) : filteredRoster.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No student records found in database.</div>
            ) : (
              filteredRoster.map((student) => (
                <div key={student.studentId} className="ag-roster-row p-4 flex justify-between items-center hover:bg-slate-800/40">
                  {/* Student Professional Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white flex items-center justify-center shadow-md border border-indigo-500/30">
                      <UserIcon size={20} className="text-indigo-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{student.name}</span>
                        {student.source === 'QR' && (
                          <Badge variant="success" className="py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                            QR VERIFIED
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Roll No: <span className="text-indigo-300 font-semibold">{student.rollNumber}</span>
                        {student.email && ` • ${student.email}`}
                        {student.status === 'PRESENT' && student.checkInTime && ` • Time: ${student.checkInTime}`}
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator & Interactive Toggles */}
                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <div className="hidden sm:block">
                      {student.status === 'PRESENT' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 size={12} /> PRESENT
                        </span>
                      )}
                      {student.status === 'ABSENT' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          <XCircle size={12} /> ABSENT
                        </span>
                      )}
                      {student.status === 'UNMARKED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          PENDING
                        </span>
                      )}
                    </div>

                    {/* Interactive Toggle Buttons */}
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                          student.status === 'PRESENT'
                            ? 'ag-status-btn-present'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700'
                        }`}
                        onClick={() => handleToggleStatus(student.studentId, 'PRESENT')}
                      >
                        <UserCheck size={14} /> Present
                      </button>
                      <button
                        type="button"
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                          student.status === 'ABSENT'
                            ? 'ag-status-btn-absent'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700'
                        }`}
                        onClick={() => handleToggleStatus(student.studentId, 'ABSENT')}
                      >
                        <UserX size={14} /> Absent
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Teacher Camera Scanner Modal */}
      <TeacherQRScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        selectedClass={selectedClass}
        selectedSection={selectedSection}
        attendanceDate={attendanceDate}
        onScanSuccess={handleQRScanVerified}
        scannedCount={presentCount}
        totalStudents={totalCount}
      />
    </div>
  );
};
