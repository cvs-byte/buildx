import React from 'react';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { BookOpen, UserCheck, Clock } from 'lucide-react';

interface CourseItem {
  id: string;
  code: string;
  title: string;
  instructor: string;
  credits: number;
  schedule: string;
  status: string;
}

export const StudentCoursesPage: React.FC = () => {
  const courses: CourseItem[] = [
    {
      id: 'c1',
      code: 'CS101',
      title: 'Data Structures & Algorithms',
      instructor: 'Eleanor Vance',
      credits: 4,
      schedule: 'Mon / Wed 10:00 AM',
      status: 'ENROLLED',
    },
    {
      id: 'c2',
      code: 'MATH201',
      title: 'Linear Algebra & Calculus',
      instructor: 'Robert Langdon',
      credits: 3,
      schedule: 'Tue / Thu 02:00 PM',
      status: 'ENROLLED',
    },
    {
      id: 'c3',
      code: 'CS204',
      title: 'Database Management Systems',
      instructor: 'Dr. Alan Turing',
      credits: 4,
      schedule: 'Fri 09:00 AM',
      status: 'ENROLLED',
    },
  ];

  const columns: Column<CourseItem>[] = [
    {
      header: 'Course Code',
      accessor: (row) => <code className="ag-code-badge">{row.code}</code>,
    },
    {
      header: 'Course Title',
      accessor: (row) => (
        <div className="ag-user-cell">
          <BookOpen size={16} className="ag-text-primary" />
          <span className="ag-cell-name">{row.title}</span>
        </div>
      ),
    },
    {
      header: 'Instructor',
      accessor: (row) => (
        <div className="ag-department-cell">
          <UserCheck size={14} />
          <span>{row.instructor}</span>
        </div>
      ),
    },
    {
      header: 'Credits',
      accessor: (row) => `${row.credits} Credits`,
    },
    {
      header: 'Schedule',
      accessor: (row) => (
        <div className="ag-department-cell">
          <Clock size={14} />
          <span>{row.schedule}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <Badge variant="success">{row.status}</Badge>,
    },
  ];

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">My Enrolled Courses</h1>
          <p className="ag-page-subtitle">
            View course syllabus, schedule, instructors, and credit allocations.
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={courses}
        keyExtractor={(c) => c.id}
        emptyMessage="No courses registered."
      />
    </div>
  );
};
