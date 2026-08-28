/**
 * Robust, safe parser for Student Personal QR codes.
 * Extracts the canonical `userId` from plain strings, JSON payloads, prefixes, or URLs.
 */
export interface ParsedStudentQR {
  userId: string;
  email?: string;
  tenantId?: string;
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

  // 1. Try parsing JSON format: { "userId": "std_101", "email": "..." }
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      const userId = parsed.userId || parsed.id || parsed.user_id || parsed.studentId;
      if (userId && typeof userId === 'string' && userId.trim() !== '') {
        return {
          userId: userId.trim(),
          email: parsed.email,
          tenantId: parsed.tenantId || parsed.schoolId,
          raw: trimmed,
        };
      }
    } catch {
      // Not JSON, continue
    }
  }

  // 2. Try parsing URL query parameter: https://academygrowth.in/student?userId=std_101
  if (trimmed.includes('?') || trimmed.includes('://')) {
    try {
      const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      const userId = url.searchParams.get('userId') || url.searchParams.get('id') || url.searchParams.get('studentId');
      if (userId && userId.trim() !== '') {
        return {
          userId: userId.trim(),
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
      return {
        userId: parts[1].trim(),
        raw: trimmed,
      };
    }
  }

  // 4. Treat raw string directly as User ID if valid alphanumeric format
  const sanitizedId = trimmed.replace(/[^a-zA-Z0-9_\-@.]/g, '');
  if (sanitizedId.length > 0) {
    return {
      userId: sanitizedId,
      raw: trimmed,
    };
  }

  return null;
}
