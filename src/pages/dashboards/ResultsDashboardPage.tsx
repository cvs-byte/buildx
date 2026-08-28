import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard.api';
import type { ResultRecord } from '../../types/dashboard.types';
import { Table, type Column } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { Search, Award, CheckCircle, GraduationCap, Filter } from 'lucide-react';
import { ResultPDFButton } from '../../components/pdf/ResultPDFButton';

export const ResultsDashboardPage: React.FC = () => {
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const loadResults = async () => {
      setIsLoading(true);
      try {
        const data = await dashboardApi.getResults();
        setResults(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadResults();
  }, []);

  const filteredResults = results.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = classFilter === 'ALL' || r.className.includes(classFilter);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const totalExams = results.length;
  const distinctionCount = results.filter((r) => r.status === 'DISTINCTION').length;
  const passCount = results.filter((r) => r.status === 'PASS' || r.status === 'DISTINCTION').length;
  const passRate = totalExams > 0 ? ((passCount / totalExams) * 100).toFixed(1) : '0.0';

  const columns: Column<ResultRecord>[] = [
    {
      header: 'Student Name',
      accessor: (row) => (
        <div className="ag-user-cell">
          <div className="ag-cell-avatar ag-avatar-student">{row.studentName.charAt(0)}</div>
          <div>
            <span className="ag-cell-name">{row.studentName}</span>
            <span className="ag-cell-sub">{row.rollNumber}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Class / Section',
      accessor: (row) => `${row.className} (${row.section})`,
    },
    {
      header: 'Subject & Exam',
      accessor: (row) => (
        <div>
          <span className="ag-cell-name">{row.subject}</span>
          <span className="ag-cell-sub">{row.examName}</span>
        </div>
      ),
    },
    {
      header: 'Score / Max',
      accessor: (row) => (
        <strong>
          {row.marksObtained} / {row.maxMarks} ({((row.marksObtained / row.maxMarks) * 100).toFixed(0)}%)
        </strong>
      ),
    },
    {
      header: 'Grade',
      accessor: (row) => (
        <Badge variant={row.grade.startsWith('A') ? 'success' : 'info'}>
          {row.grade}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'DISTINCTION' ? 'primary' : row.status === 'PASS' ? 'success' : 'danger'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="ag-page-container">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Results Dashboard</h1>
          <p className="ag-page-subtitle">
            Comprehensive overview of academic performance, grades, and distinction stats across classes.
          </p>
        </div>
        <ResultPDFButton />
      </div>

      <div className="ag-grid-stats">
        <StatCard
          title="Overall Pass Rate"
          value={`${passRate}%`}
          icon={<CheckCircle size={24} />}
          trend={{ value: 'Academic Standard Met', isPositive: true }}
          variant="emerald"
        />
        <StatCard
          title="Distinctions Awarded"
          value={distinctionCount}
          icon={<Award size={24} />}
          subtitle="Score >= 90%"
          variant="amber"
        />
        <StatCard
          title="Exams Evaluated"
          value={totalExams}
          icon={<GraduationCap size={24} />}
          subtitle="Spring Semester 2026"
          variant="blue"
        />
      </div>

      <div className="ag-filter-bar">
        <div className="ag-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search student, roll number, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="ag-filter-select-group">
          <Filter size={16} className="ag-text-muted" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="ag-filter-select"
          >
            <option value="ALL">All Classes</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 10">Grade 10</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ag-filter-select"
          >
            <option value="ALL">All Result Statuses</option>
            <option value="DISTINCTION">Distinction</option>
            <option value="PASS">Pass</option>
            <option value="FAIL">Fail</option>
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredResults}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="No student results found matching filters."
      />
    </div>
  );
};
