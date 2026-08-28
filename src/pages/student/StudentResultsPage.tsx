import React, { useState, useEffect } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { resultService } from '../../services/resultService';
import { ResultRecord } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const StudentResultsPage: React.FC = () => {
  const [results, setResults] = useState<ResultRecord[]>([]);

  useEffect(() => {
    async function load() {
      const data = await resultService.getStudentResults();
      setResults(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Academic Results</h1>
        <p className="text-xs text-slate-500 mt-1">Review term marksheets, subject scores, and teacher remarks.</p>
      </div>

      <Table isEmpty={results.length === 0} emptyMessage="No academic results available.">
        <TableHeader>
          <TableRow>
            <TableHead>Exam Term</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Marks Obtained</TableHead>
            <TableHead>Maximum Marks</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map(res => (
            <TableRow key={res.id}>
              <TableCell>{res.examTitle} ({res.term})</TableCell>
              <TableCell>{res.subject}</TableCell>
              <TableCell>{res.marksObtained}</TableCell>
              <TableCell>{res.maxMarks}</TableCell>
              <TableCell><Badge variant="primary">{res.grade}</Badge></TableCell>
              <TableCell><Badge variant="success">PUBLISHED</Badge></TableCell>
              <TableCell>{res.remarks || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
