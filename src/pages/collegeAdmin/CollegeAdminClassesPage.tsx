import React, { useState, useEffect } from 'react';
import { classGroupApi } from '../../api/classGroup.api';
import type { ClassGroup } from '../../types/classGroup.types';
import { Table, type Column } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CreateClassGroupModal } from '../../components/forms/CreateClassGroupModal';
import { Building2, Plus, Users } from 'lucide-react';

export const CollegeAdminClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const data = await classGroupApi.getClassGroups();
      setClasses(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const columns: Column<ClassGroup>[] = [
    {
      header: 'Class Group Name',
      accessor: (row) => (
        <div className="ag-tenant-info-cell">
          <div className="ag-tenant-avatar">
            <Building2 size={18} />
          </div>
          <div>
            <span className="ag-cell-name">{row.name}</span>
            <span className="ag-cell-sub">{row.gradeLevel} • {row.section}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Class Code',
      accessor: (row) => <code className="ag-code-badge">{row.code}</code>,
    },
    {
      header: 'Academic Year',
      accessor: (row) => row.academicYear,
    },
    {
      header: 'Enrolled Capacity',
      accessor: (row) => (
        <div className="ag-grade-cell">
          <Users size={14} />
          <span>{row.enrolledCount} / {row.capacity} Students</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: () => <Badge variant="success">ACTIVE GROUP</Badge>,
    },
  ];

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Student Class Grouping & Organization</h1>
          <p className="ag-page-subtitle">
            College Admin: Organize students into Class A, Class B, Grade levels, and sections for timetables and attendance.
          </p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          Organize New Class Group
        </Button>
      </div>

      <Table
        columns={columns}
        data={classes}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        emptyMessage="No class groups created yet."
      />

      <CreateClassGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadClasses}
      />
    </div>
  );
};
