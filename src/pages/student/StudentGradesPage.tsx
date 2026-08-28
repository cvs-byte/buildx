import React from 'react';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Award, FileText } from 'lucide-react';
import { ResultPDFButton } from '../../components/pdf/ResultPDFButton';

interface GradeRecord {
  id: string;
  courseCode: string;
  courseTitle: string;
  grade: string;
  percentage: number;
  remarks: string;
}

export const StudentGradesPage: React.FC = () => {
  const grades: GradeRecord[] = [
    {
      id: 'g1',
      courseCode: 'CS101',
      courseTitle: 'Data Structures & Algorithms',
      grade: 'A+',
      percentage: 95.5,
      remarks: 'Outstanding conceptual understanding',
    },
    {
      id: 'g2',
      courseCode: 'MATH201',
      courseTitle: 'Linear Algebra & Calculus',
      grade: 'A',
      percentage: 91.0,
      remarks: 'Excellent exam performance',
    },
    {
      id: 'g3',
      courseCode: 'CS204',
      courseTitle: 'Database Management Systems',
      grade: 'A-',
      percentage: 88.4,
      remarks: 'Good project work',
    },
  ];

  const columns: Column<GradeRecord>[] = [
    {
      header: 'Course Code',
      accessor: (row) => <code className="ag-code-badge">{row.courseCode}</code>,
    },
    {
      header: 'Subject Title',
      accessor: (row) => (
        <div className="ag-user-cell">
          <FileText size={16} className="ag-text-primary" />
          <span className="ag-cell-name">{row.courseTitle}</span>
        </div>
      ),
    },
    {
      header: 'Letter Grade',
      accessor: (row) => (
        <Badge variant={row.grade.startsWith('A') ? 'success' : 'info'}>
          {row.grade}
        </Badge>
      ),
    },
    {
      header: 'Score %',
      accessor: (row) => <strong>{row.percentage}%</strong>,
    },
    {
      header: 'Faculty Remarks',
      accessor: (row) => row.remarks,
    },
  ];

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Grades & Academic Transcript</h1>
          <p className="ag-page-subtitle">
            Semester transcript performance overview and faculty assessments.
          </p>
        </div>
        <div className="ag-header-actions">
          <div className="ag-gpa-badge">
            <Award size={18} />
            <span>Cumulative GPA: <strong>3.88 / 4.0</strong></span>
          </div>
          <ResultPDFButton />
        </div>
      </div>

      <Table
        columns={columns}
        data={grades}
        keyExtractor={(g) => g.id}
        emptyMessage="No grade records posted."
      />
    </div>
  );
};
