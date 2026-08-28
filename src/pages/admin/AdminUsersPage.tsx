import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { UserProfile } from '../../types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    async function loadUsers() {
      const res = await adminService.getUsers();
      setUsers(res.users);
    }
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Cognito User Directory</h1>
          <p className="text-xs text-slate-400">Manage learner roles, identity statuses, and access credentials.</p>
        </div>
      </div>

      <Table isEmpty={users.length === 0} emptyMessage="No users found. Ready for AWS Cognito User Pool synchronization.">
        <TableHeader>
          <TableRow>
            <TableHead>User Name</TableHead>
            <TableHead>Email Address</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Cognito Status</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.firstName} {u.lastName}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell><Badge variant="primary">{u.role}</Badge></TableCell>
              <TableCell><Badge variant="success">CONFIRMED</Badge></TableCell>
              <TableCell>{u.createdAt}</TableCell>
              <TableCell><Button variant="ghost" size="sm">Edit</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
