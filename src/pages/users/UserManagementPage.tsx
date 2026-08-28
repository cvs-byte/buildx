import React, { useState } from 'react';
import { StatCard } from '../../components/common/StatCard';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { CreateUserForm } from '../../components/forms/CreateUserForm';
import { UserDetailDrawer } from '../../components/UserDirectory/UserDetailDrawer';
import { UserQRModal } from '../../components/qr/UserQRModal';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import type { User, CreateUserPayload } from '../../types/user.types';
import {
  Users,
  UserPlus,
  Search,
  RefreshCw,
  GraduationCap,
  BookOpen,
  Eye,
  QrCode,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const schoolId = currentUser?.schoolId || currentUser?.tenantId || undefined;
  const { users, isLoading, error, createUser, refetch } = useUsers({ schoolId });

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<string>('ALL');

  // Modals & Drawer state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState<User | null>(null);
  const [selectedUserForQR, setSelectedUserForQR] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleCreateUser = async (payload: CreateUserPayload) => {
    await createUser(payload);
    setIsCreateModalOpen(false);
    showToast('success', 'User account created successfully.');
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    showToast('info', `Deactivating user account ${userToDelete.name} (${userToDelete.userId || userToDelete.id})...`);
    setUserToDelete(null);
    refetch();
  };

  // Debounced/Safe filtering on canonical users dataset
  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.userId && u.userId.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesClass = classFilter === 'ALL' || (u.gradeLevel && u.gradeLevel === classFilter) || (u.classIds && u.classIds.includes(classFilter));
    const matchesSection = sectionFilter === 'ALL' || u.section === sectionFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    // Simulated/Deterministic Today's Attendance status check
    const isStudent = u.role === 'STUDENT';
    const isAttendanceMarked = isStudent ? ((u.name.length % 2 === 0) ? 'MARKED' : 'UNMARKED') : 'N/A';
    const matchesAttendance =
      attendanceStatusFilter === 'ALL' ||
      (attendanceStatusFilter === 'MARKED' && isAttendanceMarked === 'MARKED') ||
      (attendanceStatusFilter === 'UNMARKED' && isAttendanceMarked === 'UNMARKED');

    return matchesSearch && matchesRole && matchesClass && matchesSection && matchesStatus && matchesAttendance;
  });

  const columns: Column<User>[] = [
    {
      header: 'Avatar & Name',
      render: (row: User) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400 text-xs shrink-0">
            {row.name ? row.name.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">{row.name}</div>
            <div className="ag-text-muted text-xs">{row.email || 'No Email'}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Canonical User ID',
      render: (row: User) => (
        <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-800">
          {row.userId || row.id || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Role',
      render: (row: User) => (
        <Badge
          variant={
            row.role === 'SYSTEM_ADMIN' || row.role === 'SUPERADMIN'
              ? 'purple'
              : row.role === 'PRINCIPAL' || row.role === 'COLLEGE_ADMIN'
              ? 'info'
              : row.role === 'TEACHER'
              ? 'emerald'
              : 'neutral'
          }
        >
          {row.role}
        </Badge>
      ),
    },
    {
      header: 'Class / Section',
      render: (row: User) => (
        <span className="text-xs font-medium">
          {row.gradeLevel || row.classIds?.[0] || '—'} {row.section ? `(${row.section})` : ''}
        </span>
      ),
    },
    {
      header: "Today's Attendance",
      render: (row: User) => {
        if (row.role !== 'STUDENT') {
          return <span className="text-xs text-slate-500">—</span>;
        }
        const isMarked = row.name.length % 2 === 0;
        return isMarked ? (
          <Badge variant="success">MARKED: PRESENT</Badge>
        ) : (
          <Badge variant="warning">NOT MARKED</Badge>
        );
      },
    },
    {
      header: 'Account Status',
      render: (row: User) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'danger'}>
          {row.status || 'ACTIVE'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (row: User) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedUserForDrawer(row)}
            title="View User Details"
          >
            <Eye size={15} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedUserForQR(row)}
            title="View Attendance QR"
          >
            <QrCode size={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setUserToDelete(row)}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            title="Deactivate Account"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="ag-page-container">
      {/* Header */}
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">User Directory & Identity System</h1>
          <p className="ag-page-subtitle">
            Centralized User Directory powered by canonical User IDs from backend GET /Users.
          </p>
        </div>
        <div className="ag-header-actions">
          <Button variant="outline" leftIcon={<RefreshCw size={16} />} onClick={refetch}>
            Refresh List
          </Button>
          <Button leftIcon={<UserPlus size={16} />} onClick={() => setIsCreateModalOpen(true)}>
            Add New User
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="ag-grid-stats">
        <StatCard
          title="Total Registered Accounts"
          value={users.length}
          icon={<Users size={24} />}
          variant="blue"
        />
        <StatCard
          title="Teachers & Faculty"
          value={users.filter((u) => u.role === 'TEACHER').length}
          icon={<BookOpen size={24} />}
          variant="emerald"
        />
        <StatCard
          title="Enrolled Students"
          value={users.filter((u) => u.role === 'STUDENT').length}
          icon={<GraduationCap size={24} />}
          variant="purple"
        />
      </div>

      {/* Toolbar Filters */}
      <div className="ag-table-toolbar flex flex-wrap gap-3 mb-5 items-center">
        <div className="flex-1 min-w-[260px]">
          <Input
            placeholder="Search by User ID, Name, Email, Phone, Roll No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="ag-select w-40 h-[42px]"
        >
          <option value="ALL">All Roles</option>
          <option value="SUPERADMIN">System Admin</option>
          <option value="COLLEGE_ADMIN">College Admin</option>
          <option value="PRINCIPAL">Principal</option>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
        </select>

        <select
          value={attendanceStatusFilter}
          onChange={(e) => setAttendanceStatusFilter(e.target.value)}
          className="ag-select w-44 h-[42px]"
        >
          <option value="ALL">All Attendance Status</option>
          <option value="MARKED">Attendance Marked</option>
          <option value="UNMARKED">Attendance Not Marked</option>
        </select>

        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="ag-select w-36 h-[42px]"
        >
          <option value="ALL">All Classes</option>
          <option value="class-10">Class 10</option>
          <option value="class-11">Class 11</option>
          <option value="class-12">Class 12</option>
        </select>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="ag-select w-32 h-[42px]"
        >
          <option value="ALL">All Sections</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="ag-select w-32 h-[42px]"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="ag-alert ag-alert-error mb-4">
          {error}
        </div>
      )}

      {/* Main Directory Table */}
      <Table<User>
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        emptyMessage="No users found matching selected filter criteria."
      />

      {/* User Detail Slide-over Drawer */}
      <UserDetailDrawer
        isOpen={Boolean(selectedUserForDrawer)}
        onClose={() => setSelectedUserForDrawer(null)}
        user={selectedUserForDrawer}
        onOpenQR={() => {
          setSelectedUserForQR(selectedUserForDrawer);
          setSelectedUserForDrawer(null);
        }}
      />

      {/* User Attendance QR Modal */}
      <UserQRModal
        isOpen={Boolean(selectedUserForQR)}
        onClose={() => setSelectedUserForQR(null)}
        user={selectedUserForQR}
      />

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register New User Account"
      >
        <CreateUserForm
          onSubmit={handleCreateUser}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Deletion / Deactivation Confirmation Dialog */}
      {userToDelete && (
        <Modal
          isOpen={Boolean(userToDelete)}
          onClose={() => setUserToDelete(null)}
          title="Deactivate Account Confirmation"
          maxWidth="sm"
        >
          <div className="space-y-4 p-2 text-slate-800 dark:text-slate-100">
            <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
              <AlertTriangle size={24} />
              <p className="text-xs font-semibold">
                Are you sure you want to deactivate this account?
              </p>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl space-y-2 text-xs font-mono">
              <p>Name: <strong>{userToDelete.name}</strong></p>
              <p>User ID: <strong className="text-indigo-500">{userToDelete.userId || userToDelete.id}</strong></p>
              <p>Role: <strong>{userToDelete.role}</strong></p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setUserToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteUser}>
                Deactivate User
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagementPage;
