import React from 'react';
import { Card } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

export const SuperAdminRolesPage: React.FC = () => {
  const roles = [
    { name: 'SUPER_ADMIN', desc: 'Global platform governance and tenant provisioning', usersCount: 1 },
    { name: 'ADMIN', desc: 'Institutional operational control, users, attendance, fees', usersCount: 0 },
    { name: 'TEACHER', desc: 'Daily attendance entry, exam marksheets, student roster', usersCount: 0 },
    { name: 'STUDENT', desc: 'Personal attendance, term results, fees, timetable', usersCount: 0 },
    { name: 'PARENT', desc: 'Multi-child monitoring, fee payments, notices', usersCount: 0 },
    { name: 'ACCOUNTANT', desc: 'Fee structures, receipts registry, payment ledgers', usersCount: 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Role-Based Access Control (RBAC) Matrix</h1>
        <p className="text-xs text-slate-400">AWS Cognito User Pool group mappings and frontend navigation policy definition.</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Cognito Group Mapping</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map(r => (
            <TableRow key={r.name}>
              <TableCell><Badge variant="primary">{r.name}</Badge></TableCell>
              <TableCell>{r.desc}</TableCell>
              <TableCell><code>us-east-1_pool/{r.name.toLowerCase()}</code></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
