/**
 * Robust, safe parser for Student Personal QR codes.
 * Extracts the canonical `userId` from plain strings, JSON payloads, prefixes, or URLs.
 */
export interface ParsedStudentQR {
  userId: string;
  studentId: string;
  email?: string;
  tenantId?: string;
  type?: string;
  version?: number;
  raw: string;
}

export function parseStudentQR(rawInput: string): ParsedStudentQR | null {
  if (!rawInput || typeof rawInput !== 'string') {
    return null;
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return null;
  }

  // 1. Try parsing JSON format: { "type": "ACADEMY_STUDENT", "studentId": "..." }
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const targetId = parsed.studentId || parsed.userId || parsed.id || parsed.user_id || parsed.rollNumber || parsed.email;
      if (targetId && (typeof targetId === 'string' || typeof targetId === 'number')) {
        const cleanUserId = String(targetId).trim();
        if (cleanUserId !== '') {
          return {
            userId: cleanUserId,
            studentId: cleanUserId,
            email: parsed.email,
            tenantId: parsed.tenantId || parsed.schoolId,
            type: parsed.type,
            version: parsed.version,
            raw: trimmed,
          };
        }
      }
    } catch {
      // Not JSON, continue
    }
  }

  // 2. Try parsing URL query parameter
  if (trimmed.includes('?') || trimmed.includes('://')) {
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      const targetId = url.searchParams.get('studentId') || url.searchParams.get('userId') || url.searchParams.get('id') || url.searchParams.get('email');
      if (targetId && targetId.trim() !== '') {
        const cleanId = targetId.trim();
        return {
          userId: cleanId,
          studentId: cleanId,
          raw: trimmed,
        };
      }
    } catch {
      // Invalid URL format, continue
    }
  }

  // 3. Try parsing prefixed string: USER:std_101 or STUDENT:std_101
  if (trimmed.toUpperCase().startsWith('USER:') || trimmed.toUpperCase().startsWith('STUDENT:')) {
    const parts = trimmed.split(':');
    if (parts.length >= 2 && parts[1].trim() !== '') {
      const cleanId = parts[1].trim();
      return {
        userId: cleanId,
        studentId: cleanId,
        raw: trimmed,
      };
    }
  }

  // 4. Treat raw string directly as User ID if valid format
  const sanitizedId = trimmed.replace(/[^a-zA-Z0-9_\-@.]/g, '');
  if (sanitizedId.length > 0) {
    return {
      userId: sanitizedId,
      studentId: sanitizedId,
      raw: trimmed,
    };
  }

  return null;
}
