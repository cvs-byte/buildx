import React, { useState } from 'react';
import { FileSpreadsheet, Save, Send } from 'lucide-react';
import { resultService } from '../../services/resultService';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';

export const TeacherResultsPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('Grade 10 - Sec A');
  const [selectedExam, setSelectedExam] = useState('Mid-Term Examination 2026');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const handleSubmitResults = async (status: 'draft' | 'submitted') => {
    setSubmitting(true);
    setAlertMsg(null);
    try {
      await resultService.submitTeacherResults(selectedClass, selectedExam, selectedSubject, []);
      setAlertMsg(`Marksheet ${status === 'submitted' ? 'submitted to Admin for publication review' : 'saved as draft'}.`);
    } catch (err: any) {
      setAlertMsg('Results submission service is not configured yet. AWS Lambda endpoint pending.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Academic Results & Marks Entry</h1>
        <p className="text-xs text-slate-500 mt-1">Select class, examination term, and subject to input student grades and remarks.</p>
      </div>

      {alertMsg && <Alert variant="info" onClose={() => setAlertMsg(null)}>{alertMsg}</Alert>}

      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Class & Section"
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            options={[
              { label: 'Grade 10 - Section A', value: 'Grade 10 - Sec A' },
              { label: 'Grade 10 - Section B', value: 'Grade 10 - Sec B' },
            ]}
          />
          <Select
            label="Examination Term"
            value={selectedExam}
            onChange={e => setSelectedExam(e.target.value)}
            options={[
              { label: 'Mid-Term Examination 2026', value: 'Mid-Term Examination 2026' },
              { label: 'Final Examination 2026', value: 'Final Examination 2026' },
            ]}
          />
          <Select
            label="Subject"
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            options={[
              { label: 'Mathematics', value: 'Mathematics' },
              { label: 'Physics', value: 'Physics' },
            ]}
          />
        </div>
      </Card>

      <Card className="p-12 text-center text-slate-500 space-y-4">
        <FileSpreadsheet className="w-10 h-10 text-indigo-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">No student marksheet records available.</h3>
        <p className="text-xs max-w-sm mx-auto">
          Enrolled student mark entry rows will be populated when connected to AWS API Gateway endpoints.
        </p>

        <div className="flex justify-center gap-3 pt-4">
          <Button variant="outline" size="sm" isLoading={submitting} onClick={() => handleSubmitResults('draft')} leftIcon={<Save className="w-4 h-4" />}>
            Save Draft
          </Button>
          <Button variant="primary" size="sm" isLoading={submitting} onClick={() => handleSubmitResults('submitted')} leftIcon={<Send className="w-4 h-4" />}>
            Submit Results
          </Button>
        </div>
      </Card>
    </div>
  );
};
