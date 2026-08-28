import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { QRCanvas } from '../../components/qr/QRCanvas';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import type { User } from '../../types/user.types';
import {
  QrCode,
  Printer,
  Download,
  Search,
  RefreshCw,
  CheckSquare,
  Square,
  ShieldCheck,
  Building2,
  Users,
} from 'lucide-react';

export const AdminQRManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const schoolId = currentUser?.schoolId || currentUser?.tenantId || undefined;
  const { users, isLoading, error, refetch } = useUsers({ schoolId });

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [gridSize, setGridSize] = useState<1 | 2 | 4 | 6 | 8>(4);

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const students = users.filter((u) => u.role === 'STUDENT');

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.userId && s.userId.toLowerCase().includes(q)) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(q));

    const matchesClass =
      classFilter === 'ALL' || s.gradeLevel === classFilter || s.classIds?.includes(classFilter);
    const matchesSection = sectionFilter === 'ALL' || s.section === sectionFilter;

    return matchesSearch && matchesClass && matchesSection;
  });

  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === filteredStudents.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredStudents.map((s) => s.userId || s.id));
    }
  };

  const handleToggleUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((i) => i !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handlePrintSelected = () => {
    window.print();
  };

  const displayedStudents =
    selectedUserIds.length > 0
      ? filteredStudents.filter((s) => selectedUserIds.includes(s.userId || s.id))
      : filteredStudents;

  return (
    <div className="ag-page-container space-y-6">
      {/* Header */}
      <div className="ag-page-header ag-no-print">
        <div>
          <h1 className="ag-page-title">Bulk Student QR Pass Generator</h1>
          <p className="ag-page-subtitle">
            Generate, preview, and print official A4 student QR cards encoded with canonical User IDs.
          </p>
        </div>
        <div className="ag-header-actions">
          <Button variant="outline" leftIcon={<RefreshCw size={16} />} onClick={refetch}>
            Refresh Students
          </Button>
          <Button
            variant="primary"
            leftIcon={<Printer size={16} />}
            onClick={handlePrintSelected}
            disabled={displayedStudents.length === 0}
          >
            Print QR Cards ({displayedStudents.length})
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="ag-grid-stats ag-no-print">
        <StatCard
          title="Total Student Passes"
          value={students.length}
          icon={<QrCode size={24} />}
          variant="purple"
        />
        <StatCard
          title="Selected for Batch Print"
          value={selectedUserIds.length > 0 ? selectedUserIds.length : 'All Filtered'}
          icon={<Users size={24} />}
          variant="emerald"
        />
        <StatCard
          title="Grid Cards Per Page"
          value={`${gridSize} Cards / Page`}
          icon={<Building2 size={24} />}
          variant="blue"
        />
      </div>

      {/* Toolbar controls */}
      <div className="ag-table-toolbar flex flex-wrap gap-3 items-center ag-no-print mb-6">
        <div className="flex-1 min-w-[260px]">
          <Input
            placeholder="Search student by Name, User ID, Roll No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="ag-select w-40 h-[42px]"
        >
          <option value="ALL">All Classes</option>
          <option value="class-10">Class 10</option>
          <option value="class-11">Class 11</option>
          <option value="class-12">Class 12</option>
        </select>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="ag-select w-36 h-[42px]"
        >
          <option value="ALL">All Sections</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs font-semibold">
          <span className="px-2 text-slate-400">Cards / Page:</span>
          {([1, 2, 4, 6, 8] as const).map((n) => (
            <button
              key={n}
              onClick={() => setGridSize(n)}
              className={`px-2.5 py-1 rounded transition-colors ${
                gridSize === n
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleSelectAll}
          leftIcon={
            selectedUserIds.length === filteredStudents.length ? (
              <CheckSquare size={16} />
            ) : (
              <Square size={16} />
            )
          }
        >
          {selectedUserIds.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      {error && <div className="ag-alert ag-alert-error ag-no-print">{error}</div>}

      {/* QR Cards Grid Container */}
      {displayedStudents.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 space-y-2 ag-no-print">
          <QrCode size={40} className="mx-auto text-indigo-500" />
          <h3 className="font-bold text-white text-base">No students selected for QR generation.</h3>
          <p className="text-xs">Adjust your search or filter options above to view student QR passes.</p>
        </div>
      ) : (
        <div className={`ag-qr-card-grid ag-qr-grid-${gridSize}`}>
          {displayedStudents.map((s) => {
            const userId = s.userId || s.id;
            const isSelected = selectedUserIds.includes(userId);
            const qrPayload = JSON.stringify({
              type: 'ACADEMY_ATTENDANCE',
              version: 1,
              userId: String(userId),
            });

            return (
              <div
                key={userId}
                onClick={() => handleToggleUser(userId)}
                className={`ag-printable-qr-card relative p-5 bg-slate-900 border ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                } rounded-2xl shadow-xl flex flex-col items-center text-center space-y-3 cursor-pointer transition-all`}
              >
                {/* Checkbox indicator */}
                <div className="ag-no-print absolute top-3 right-3 text-indigo-400">
                  {isSelected ? <CheckSquare size={18} /> : <Square size={18} className="text-slate-600" />}
                </div>

                {/* Header info */}
                <div className="w-full text-left border-b border-slate-800 pb-2">
                  <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold uppercase">
                    <span>{s.schoolName || currentUser?.schoolName || 'ACADEMY PLATFORM'}</span>
                    <Badge variant="purple">STUDENT</Badge>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5 truncate">{s.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {userId} | Class: {s.gradeLevel || s.classIds?.[0] || '10'}-{s.section || 'A'}
                  </p>
                </div>

                {/* Crisp SVG QR Code */}
                <div className="py-1">
                  <QRCanvas value={qrPayload} size={170} fgColor="#0f172a" bgColor="#ffffff" />
                </div>

                {/* Security footer */}
                <div className="w-full bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 text-[11px] text-slate-300 font-mono space-y-0.5">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold">
                    <ShieldCheck size={12} />
                    <span>ACADEMY ATTENDANCE PASS</span>
                  </div>
                  <p>Scan identity for class check-in</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminQRManagementPage;
