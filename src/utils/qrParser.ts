/**
 * Production-grade, safe parser for Student QR payloads.
 * Strictly validates QR structure:
 * Preferred payload: { "v": 1, "type": "student", "studentId": "STU001" }
 * Supports legacy formats if matching valid student ID format.
 */
export interface ParsedStudentQR {
  studentId: string;
  userId: string;
  version?: number;
  type?: string;
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

  // 1. Try parsing JSON format
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    try {
      let parsedObj: any = trimmed;
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        parsedObj = JSON.parse(trimmed);
      }
      if (typeof parsedObj === 'string' && parsedObj.startsWith('{')) {
        parsedObj = JSON.parse(parsedObj);
      }
      if (typeof parsedObj !== 'object' || parsedObj === null) {
        parsedObj = JSON.parse(trimmed);
      }

      if (typeof parsedObj === 'object' && parsedObj !== null) {
        // Standard payload format: { v: 1, type: "student", studentId: "STU001" }
        const version = parsedObj.v ?? parsedObj.version;
        const type = parsedObj.type;
        const rawStudentId =
          parsedObj.studentId ||
          parsedObj.userId ||
          parsedObj.id ||
          parsedObj.student_id ||
          parsedObj.user_id;

        if (rawStudentId && (typeof rawStudentId === 'string' || typeof rawStudentId === 'number')) {
          const cleanStudentId = String(rawStudentId).trim();

          // Reject empty or suspicious values
          if (cleanStudentId && !cleanStudentId.includes('://') && !cleanStudentId.startsWith('{')) {
            // Check version & type if provided
            const isStandardFormat = version === 1 && (type === 'student' || type === 'ACADEMY_STUDENT');
            const isLegacyJson = Boolean(type === 'ACADEMY_STUDENT' || parsedObj.studentId || parsedObj.userId);

            if (isStandardFormat || isLegacyJson) {
              return {
                studentId: cleanStudentId,
                userId: cleanStudentId,
                version: typeof version === 'number' ? version : 1,
                type: typeof type === 'string' ? type : 'student',
                email: parsedObj.email ? String(parsedObj.email).trim() : undefined,
                tenantId: parsedObj.tenantId || parsedObj.schoolId ? String(parsedObj.tenantId || parsedObj.schoolId).trim() : undefined,
                raw: trimmed,
              };
            }
          }
        }
      }
    } catch {
      // Ignore JSON parse errors and fallback
    }
  }

  // 2. Reject URLs, arbitrary web links, or random text with spaces/special characters
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('?') || trimmed.includes('/')) {
    return null;
  }

  // 3. Fallback: Legacy plain Student ID (e.g. STU001 or std_101 or user email / ID)
  // Must be alphanumeric string, optionally with hyphens, underscores, dots, or at-symbols
  const isPlainStudentIdFormat = /^[a-zA-Z0-9_\-@.]{3,64}$/.test(trimmed);
  if (isPlainStudentIdFormat) {
    return {
      studentId: trimmed,
      userId: trimmed,
      version: 1,
      type: 'student',
      raw: trimmed,
    };
  }

  return null;
}

