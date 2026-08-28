/**
 * Utility function to clean and validate user creation and update payloads before API submission.
 * Removes empty strings, nulls, undefined values, and enforces school/creator context for DynamoDB and API Gateway.
 */
export function cleanUserPayload(
  rawPayload: Record<string, any>,
  sessionUser?: any
): Record<string, any> {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(rawPayload)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (typeof value === 'string' && value.trim() === '') {
      continue;
    }
    if (Array.isArray(value) && value.length === 0) {
      continue;
    }
    cleaned[key] = value;
  }

  // Inject and enforce school context across all school ID and school Name key variations
  const isSuperAdmin =
    sessionUser?.role === 'SUPERADMIN' ||
    sessionUser?.role === 'SYSTEM_ADMIN' ||
    sessionUser?.role === 'ADMIN';

  const effectiveSchoolId =
    (!isSuperAdmin && (sessionUser?.schoolId || sessionUser?.tenantId || sessionUser?.school_id || sessionUser?.tenant_id)) ||
    rawPayload?.schoolId ||
    rawPayload?.tenantId ||
    rawPayload?.school_id ||
    rawPayload?.tenant_id ||
    sessionUser?.schoolId ||
    sessionUser?.tenantId ||
    sessionUser?.school_id ||
    sessionUser?.tenant_id;

  const effectiveSchoolName =
    (!isSuperAdmin && (sessionUser?.schoolName || sessionUser?.tenantName || sessionUser?.school_name || sessionUser?.tenant_name)) ||
    rawPayload?.schoolName ||
    rawPayload?.tenantName ||
    rawPayload?.school_name ||
    rawPayload?.tenant_name ||
    sessionUser?.schoolName ||
    sessionUser?.tenantName ||
    sessionUser?.school_name ||
    sessionUser?.tenant_name;

  if (effectiveSchoolId) {
    const schoolIdStr = String(effectiveSchoolId);
    cleaned.schoolId = schoolIdStr;
    cleaned.tenantId = schoolIdStr;
    cleaned.school_id = schoolIdStr;
    cleaned.tenant_id = schoolIdStr;
  }

  if (effectiveSchoolName) {
    const schoolNameStr = String(effectiveSchoolName);
    cleaned.schoolName = schoolNameStr;
    cleaned.tenantName = schoolNameStr;
    cleaned.school_name = schoolNameStr;
    cleaned.tenant_name = schoolNameStr;
  }

  if (sessionUser) {
    if (!cleaned.createdByUserId && (sessionUser.userId || sessionUser.id)) {
      cleaned.createdByUserId = String(sessionUser.userId || sessionUser.id);
    }
    if (!cleaned.createdByEmail && sessionUser.email) {
      cleaned.createdByEmail = String(sessionUser.email);
    }
  }

  return cleaned;
}
