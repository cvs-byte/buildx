import type { Role } from '../types/auth.types';
import { ROLE_LABELS } from './constants';

export const formatRoleName = (role?: Role | string): string => {
  if (!role) return '';
  return ROLE_LABELS[role as Role] || role;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const getInitials = (firstName?: string, lastName?: string): string => {
  const f = firstName ? firstName.charAt(0).toUpperCase() : '';
  const l = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${f}${l}` || 'AG';
};
