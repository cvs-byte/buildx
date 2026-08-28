import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, FileText } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../hooks/useTenant';
import { useToast } from '../../hooks/useToast';

export interface ResultPDFButtonProps {
  studentName?: string;
  rollNumber?: string;
  gradeLevel?: string;
  results?: {
    code: string;
    title: string;
    credits: number;
    score: number;
    grade: string;
    status: string;
  }[];
}

export const ResultPDFButton: React.FC<ResultPDFButtonProps> = ({
  studentName,
  rollNumber,
  gradeLevel,
  results,
}) => {
  const { user } = useAuth();
  const { activeTenant } = useTenant();
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const defaultResults = results || [
    { code: 'CS101', title: 'Data Structures & Algorithms', credits: 4, score: 95.5, grade: 'A+', status: 'DISTINCTION' },
    { code: 'MATH201', title: 'Linear Algebra & Calculus', credits: 3, score: 91.0, grade: 'A', status: 'DISTINCTION' },
    { code: 'CS204', title: 'Database Management Systems', credits: 4, score: 88.4, grade: 'A-', status: 'PASS' },
    { code: 'ENG102', title: 'Technical Communication & Ethics', credits: 2, score: 92.0, grade: 'A+', status: 'DISTINCTION' },
  ];

  const currentStudentName = studentName || `${user?.firstName || 'Sophia'} ${user?.lastName || 'Chen'}`;
  const currentRollNumber = rollNumber || user?.rollNumber || 'CS-2026-001';
  const currentGrade = gradeLevel || user?.gradeLevel || 'Grade 11 - Computer Science';
  const tenantName = activeTenant?.name || user?.tenantName || 'Oxford International College';

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    showToast('info', 'Generating official academic transcript PDF...');

    try {
      // Create offscreen container for PDF capture
      const reportElement = document.createElement('div');
      reportElement.className = 'ag-pdf-template';
      reportElement.innerHTML = `
        <div style="padding: 40px; background: #ffffff; color: #1e293b; font-family: 'Plus Jakarta Sans', Arial, sans-serif; width: 800px; border: 2px solid #e2e8f0; border-radius: 8px;">
          
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 25px;">
            <div>
              <h1 style="font-size: 24px; color: #4f46e5; margin: 0; font-weight: 800;">${tenantName}</h1>
              <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0;">Official Academic Progress Report Card</p>
            </div>
            <div style="text-align: right;">
              <span style="display: inline-block; background: #EEF2FF; color: #4F46E5; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; border: 1px solid #C7D2FE;">OFFICIAL TRANSCRIPT</span>
              <p style="font-size: 11px; color: #94a3b8; margin: 4px 0 0 0;">Issued: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <!-- Student Profile -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 18px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
            <div>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Student Full Name:</p>
              <h3 style="margin: 2px 0 0 0; font-size: 16px; color: #0f172a;">${currentStudentName}</h3>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Roll / Registration ID:</p>
              <h3 style="margin: 2px 0 0 0; font-size: 16px; color: #4f46e5; font-family: monospace;">${currentRollNumber}</h3>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Grade Level & Batch:</p>
              <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: #334155;">${currentGrade}</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 12px; color: #64748b;">Academic Semester:</p>
              <p style="margin: 2px 0 0 0; font-size: 14px; font-weight: 600; color: #334155;">Spring Semester 2026</p>
            </div>
          </div>

          <!-- Results Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px;">
            <thead>
              <tr style="background: #4f46e5; color: #ffffff; text-align: left;">
                <th style="padding: 10px 12px; border-radius: 4px 0 0 0;">Course Code</th>
                <th style="padding: 10px 12px;">Subject Title</th>
                <th style="padding: 10px 12px; text-align: center;">Credits</th>
                <th style="padding: 10px 12px; text-align: center;">Score %</th>
                <th style="padding: 10px 12px; text-align: center;">Grade</th>
                <th style="padding: 10px 12px; text-align: right; border-radius: 0 4px 0 0;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${defaultResults
                .map(
                  (r, idx) => `
                <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding: 10px 12px; font-family: monospace; font-weight: 700; color: #4f46e5;">${r.code}</td>
                  <td style="padding: 10px 12px; font-weight: 600;">${r.title}</td>
                  <td style="padding: 10px 12px; text-align: center;">${r.credits}</td>
                  <td style="padding: 10px 12px; text-align: center; font-weight: 700;">${r.score}%</td>
                  <td style="padding: 10px 12px; text-align: center; font-weight: 800; color: #10b981;">${r.grade}</td>
                  <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #059669;">${r.status}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <!-- Footer & CGPA -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding-top: 20px; border-top: 2px dashed #cbd5e1;">
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; padding: 12px 18px; border-radius: 8px;">
              <span style="font-size: 12px; color: #92400E; font-weight: 600;">Cumulative GPA (CGPA):</span>
              <h2 style="margin: 0; font-size: 22px; color: #B45309; font-weight: 800;">3.88 / 4.0</h2>
            </div>

            <div style="text-align: center;">
              <div style="border-bottom: 1px solid #0f172a; width: 160px; height: 35px; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; font-family: 'Brush Script MT', cursive; font-size: 20px; color: #4f46e5;">
                Dr. A. Pendelton
              </div>
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: #475569;">Controller of Examinations</p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">${tenantName}</p>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(reportElement);

      const canvas = await html2canvas(reportElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      document.body.removeChild(reportElement);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`AcademyGrowth_Result_${currentRollNumber}.pdf`);

      showToast('success', 'Student Result PDF generated and downloaded successfully!');
    } catch (err: any) {
      showToast('error', 'Failed to generate PDF. Triggering print fallback.');
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="primary"
      leftIcon={isGenerating ? <FileText size={16} /> : <Download size={16} />}
      isLoading={isGenerating}
      onClick={handleDownloadPDF}
    >
      {isGenerating ? 'Generating PDF...' : 'Download Results PDF'}
    </Button>
  );
};
