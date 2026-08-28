import React from 'react';
import { UnauthorizedPage } from '../common/UnauthorizedPage';

/**
 * Access Restricted Component
 * Principal Management is exclusively reserved for System Admin (/system-admin/principals).
 * Direct URL access attempts by College Admin render HTTP 403 Forbidden.
 */
export const CollegeAdminPrincipalsPage: React.FC = () => {
  return <UnauthorizedPage />;
};

export default CollegeAdminPrincipalsPage;
