import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import type { Role } from '../../types/auth.types';
import type { CreateUserPayload } from '../../types/user.types';
import { useAuth } from '../../hooks/useAuth';
import { getCreatableRoles, canCreateRole } from '../../utils/permissions';
import { cleanUserPayload } from '../../utils/payload.utils';
import { storage } from '../../utils/storage';
import { Lock, Mail, User as UserIcon, Phone, Building2, ShieldCheck, Layers } from 'lucide-react';

export interface CreateUserFormProps {
  initialRole?: Role;
  targetRole?: Role;
  defaultRole?: Role;
  onSubmit: (payload: CreateUserPayload) => Promise<void>;
  onCancel: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  initialRole,
  targetRole,
  defaultRole,
  onSubmit,
  onCancel,
}) => {
  const { user: currentUser } = useAuth();

  const effectiveInitialRole = initialRole || targetRole || defaultRole;
  const creatableRoles = getCreatableRoles(currentUser?.role);
  const defaultSelectedRole =
    effectiveInitialRole && creatableRoles.includes(effectiveInitialRole)
      ? effectiveInitialRole
      : creatableRoles[0] || 'TEACHER';

  const isSuperAdmin =
    currentUser?.role === 'SYSTEM_ADMIN' ||
    currentUser?.role === 'SUPERADMIN' ||
    currentUser?.role === 'ADMIN';

  // School defaults directly from authenticated identity (no hardcoded fallback text)
  const currentSchoolId = currentUser?.schoolId || currentUser?.tenantId || '';
  const currentSchoolName = currentUser?.schoolName || currentUser?.tenantName || '';

  const currentUserId = currentUser?.userId || currentUser?.id || '';

  const derivedPrincipalId =
    currentUser?.role === 'PRINCIPAL'
      ? currentUserId
      : currentUser?.principalId || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: defaultSelectedRole as Role,
    schoolName: isSuperAdmin ? '' : currentSchoolName,
    schoolId: isSuperAdmin ? '' : currentSchoolId,
    principalId: derivedPrincipalId,
    classIdsStr: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    // Teacher School Assignment Validation (Requirement 3)
    const userRoleUpper = String(currentUser?.role || '').toUpperCase();
    const isTeacherRole = userRoleUpper === 'TEACHER' || userRoleUpper === 'FACULTY';
    const activeSchoolId = currentUser?.schoolId || currentUser?.tenantId || storage.getSchoolId();

    if (isTeacherRole && !activeSchoolId) {
      setApiError('Teacher profile missing school assignment. Please relogin or contact support.');
      return false;
    }

    // 1. Name Validation
    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Full name is required.';
    }

    // 2. Email Validation
    if (!formData.email || !formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    // 3. Password Validation
    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters long.';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    // 4. Role Authorization Validation
    if (!formData.role) {
      errs.role = 'Role selection is required.';
    } else if (!canCreateRole(currentUser?.role, formData.role)) {
      errs.role = `You are not authorized to create a ${formData.role} account.`;
    }

    // 5. School Validation for PRINCIPAL / SCHOOLADMIN roles if SuperAdmin
    if (isSuperAdmin && (formData.role === 'PRINCIPAL' || formData.role === 'SCHOOLADMIN' || formData.role === 'COLLEGE_ADMIN')) {
      if (!formData.schoolName || !formData.schoolName.trim()) {
        errs.schoolName = 'School Name is required.';
      }
      if (!formData.schoolId || !formData.schoolId.trim()) {
        errs.schoolId = 'School ID is required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const classIds = formData.classIdsStr
        ? formData.classIdsStr.split(',').map((c) => c.trim()).filter(Boolean)
        : [];

      const schoolIdToUse = isSuperAdmin ? formData.schoolId.trim() : (currentSchoolId || formData.schoolId.trim());
      const schoolNameToUse = isSuperAdmin ? formData.schoolName.trim() : (currentSchoolName || formData.schoolName.trim());

      // Raw uncleaned form payload object
      const rawPayload = {
        name: formData.name,
        fullName: formData.name,
        email: formData.email.toLowerCase(),
        phoneNumber: formData.phone,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        schoolName: schoolNameToUse,
        schoolId: schoolIdToUse,
        principalId: isSuperAdmin
          ? (formData.role === 'PRINCIPAL' ? undefined : (formData.principalId || derivedPrincipalId))
          : derivedPrincipalId,
        createdBy: currentUser?.role ? currentUser.role.toLowerCase() : undefined,
        createdByEmail: currentUser?.email,
        createdByUserId: currentUserId,
        classIds: (formData.role === 'TEACHER' || formData.role === 'STUDENT') && classIds.length > 0 ? classIds : undefined,
        status: formData.status,
      };

      // Apply cleanUserPayload utility to eliminate empty strings, nulls, format keys & enforce lineage
      const cleaned = cleanUserPayload(rawPayload, currentUser) as any;

      await onSubmit(cleaned);
    } catch (err: any) {
      setApiError(err.message || 'Failed to create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = creatableRoles.map((r: Role) => ({
    value: r,
    label:
      r === 'SUPERADMIN' || r === 'SYSTEM_ADMIN'
        ? 'System Admin'
        : r === 'PRINCIPAL'
        ? 'Principal / Dean'
        : r === 'COLLEGE_ADMIN'
        ? 'College Administrator'
        : r === 'SCHOOLADMIN'
        ? 'School Administrator'
        : r === 'TEACHER'
        ? 'Teacher / Faculty'
        : 'Student',
  }));

  const isRoleLocked = !!(effectiveInitialRole && creatableRoles.length <= 1);

  return (
    <form onSubmit={handleSubmit} className="ag-form-stack" noValidate>
      {apiError && (
        <div className="ag-alert ag-alert-error" role="alert">
          <span>{apiError}</span>
        </div>
      )}

      {/* Role Selection Dropdown */}
      {!isRoleLocked ? (
        <Select
          label="Account Role *"
          options={roleOptions}
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value as Role)}
          error={errors.role}
          required
        />
      ) : (
        <div className="ag-form-group">
          <label className="ag-form-label">Account Role</label>
          <div className="ag-input-static" style={{ padding: '0.625rem 1rem', background: 'var(--bg-muted)', borderRadius: '6px', fontWeight: 600 }}>
            {formData.role}
          </div>
        </div>
      )}

      {/* CONDITIONAL INPUTS BASED ON SELECTED ROLE */}

      {/* SuperAdmin Editable Inputs for School Name & School ID */}
      {isSuperAdmin && (formData.role === 'PRINCIPAL' || formData.role === 'SCHOOLADMIN' || formData.role === 'COLLEGE_ADMIN') && (
        <div className="ag-form-row">
          <Input
            label="School Name *"
            placeholder="Enter School Name"
            value={formData.schoolName}
            onChange={(e) => handleChange('schoolName', e.target.value)}
            leftIcon={<Building2 size={18} />}
            error={errors.schoolName}
            required
          />
          <Input
            label="School ID *"
            placeholder="Enter School ID (e.g. sch-001)"
            value={formData.schoolId}
            onChange={(e) => handleChange('schoolId', e.target.value)}
            error={errors.schoolId}
            required
          />
        </div>
      )}

      {/* Optional principalId Input for SuperAdmins creating SCHOOLADMIN */}
      {isSuperAdmin && (formData.role === 'SCHOOLADMIN' || formData.role === 'COLLEGE_ADMIN') && (
        <Input
          label="Assigned Principal ID (Optional)"
          placeholder="e.g. USR-PR-001"
          value={formData.principalId}
          onChange={(e) => handleChange('principalId', e.target.value)}
          leftIcon={<UserIcon size={18} />}
        />
      )}

      {/* TEACHER or STUDENT Class IDs Input */}
      {(formData.role === 'TEACHER' || formData.role === 'STUDENT') && (
        <div className="ag-form-row">
          {isSuperAdmin && (
            <Input
              label="School ID *"
              placeholder="e.g. SCH-101"
              value={formData.schoolId}
              onChange={(e) => handleChange('schoolId', e.target.value)}
              leftIcon={<Building2 size={18} />}
              error={errors.schoolId}
            />
          )}
          <Input
            label={formData.role === 'TEACHER' ? 'Assigned Class IDs (Comma separated)' : 'Class / Section IDs (Comma separated)'}
            placeholder="e.g. CLASS-10A, CLASS-10B"
            value={formData.classIdsStr}
            onChange={(e) => handleChange('classIdsStr', e.target.value)}
            leftIcon={<Layers size={18} />}
          />
        </div>
      )}

      {/* Name and Email */}
      <div className="ag-form-row">
        <Input
          label="Full Name *"
          placeholder="e.g. John Doe"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          leftIcon={<UserIcon size={18} />}
          error={errors.name}
          required
        />
        <Input
          label="Email Address *"
          type="email"
          placeholder="e.g. user@academygrowth.in"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          leftIcon={<Mail size={18} />}
          error={errors.email}
          required
          autoComplete="new-email"
        />
      </div>

      {/* Passwords */}
      <div className="ag-form-row">
        <Input
          label="Password *"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          leftIcon={<Lock size={18} />}
          error={errors.password}
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirm Password *"
          type="password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          leftIcon={<Lock size={18} />}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />
      </div>

      {/* Phone and Status */}
      <div className="ag-form-row">
        <Input
          label="Phone Number (Optional)"
          type="tel"
          placeholder="+919876543210"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          leftIcon={<Phone size={18} />}
        />
        <Select
          label="Account Status"
          options={[
            { value: 'ACTIVE', label: 'ACTIVE (Can log in)' },
            { value: 'INACTIVE', label: 'INACTIVE (Login disabled)' },
          ]}
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
        />
      </div>

      <div className="ag-modal-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} leftIcon={<ShieldCheck size={18} />}>
          Create {formData.role} User
        </Button>
      </div>
    </form>
  );
};

