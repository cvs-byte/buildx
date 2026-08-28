import React from 'react';
import { Accordion } from '../../components/ui/Accordion';
import { Badge } from '../../components/ui/Badge';
import { Breadcrumb } from '../../components/ui/Breadcrumb';

export const FaqPage: React.FC = () => {
  const faqItems = [
    {
      id: 'faq-1',
      title: 'What is AcademyGrowth?',
      content: 'AcademyGrowth is a unified academic management platform that helps institutions manage students, attendance, results, fees, events and daily operations from one secure platform.',
    },
    {
      id: 'faq-2',
      title: 'Who can use AcademyGrowth?',
      content: 'AcademyGrowth provides dedicated portals for Super Admins, School Administrators, Teachers, Students, Parents, and Accountants.',
    },
    {
      id: 'faq-3',
      title: 'How does attendance management work?',
      content: 'Teachers or admins select their class and record present, absent, or late statuses for each student. Records are dynamically summarized in attendance reports.',
    },
    {
      id: 'faq-4',
      title: 'How are results managed?',
      content: 'Teachers enter examination marks and grades for assigned subjects. Administrators review draft marksheets and publish them for students and parents to view.',
    },
    {
      id: 'faq-5',
      title: 'How are fees tracked?',
      content: 'Accountants create fee structures, record payments, issue receipts, and track pending or overdue balances across student accounts.',
    },
    {
      id: 'faq-6',
      title: 'Can parents access student information?',
      content: 'Yes! Parents access a dedicated Parent Portal where they can monitor attendance, exam results, fee balances, and notices for all linked children.',
    },
    {
      id: 'faq-7',
      title: 'Can teachers manage attendance?',
      content: 'Yes. Teachers can mark class attendance and enter student marks directly from mobile or desktop browsers.',
    },
    {
      id: 'faq-8',
      title: 'Can administrators manage users?',
      content: 'Yes. Administrators manage student rosters, staff accounts, parent linkages, class section assignments, and system audit logs.',
    },
    {
      id: 'faq-9',
      title: 'Is AcademyGrowth cloud-based?',
      content: 'Yes. Built on AWS serverless cloud infrastructure using Amazon Cognito, API Gateway, Lambda, and DynamoDB for high reliability.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Breadcrumb items={[{ label: 'FAQ' }]} />

      <div className="space-y-4 text-center">
        <Badge variant="secondary">Help & Support</Badge>
        <h1 className="text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-slate-600 dark:text-slate-400 text-base">
          Find quick answers about AcademyGrowth platform capabilities, parent linkages, and portal operations.
        </p>
      </div>

      <Accordion items={faqItems} defaultExpandedId="faq-1" />
    </div>
  );
};
