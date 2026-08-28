/**
 * Production-grade QR Parser and Email Validator for Student QR Attendance.
 *
 * In production, student QR codes decode to the student's EMAIL ADDRESS.
 * This module safely parses, extracts, and validates student emails from QR payloads.
 */

export interface ParsedStudentQR {
  email: string;
  studentId?: string;
  userId?: string;
  version?: number;
  type?: string;
  tenantId?: string;
  raw: string;
}

/**
 * Validates whether a string is a well-formed email address.
 */
export function isValidEmail(email: unknown): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const clean = email.trim().toLowerCase();
  // Standard RFC 5322 compliant regex for email validation
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(clean);
}

/**
 * Extracts and normalizes the email address from a raw QR scan string.
 * Supports:
 * 1. Plain text email: "student@example.com"
 * 2. JSON with email: {"email": "student@example.com"}
 * 3. JSON with studentId/userId containing email
 * 4. Legacy structured formats
 */
export function extractEmailFromQR(rawInput: string): string | null {
  if (!rawInput || typeof rawInput !== 'string') {
    return null;
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return null;
  }

  // 1. Direct plain email check
  if (isValidEmail(trimmed)) {
    return trimmed.toLowerCase();
  }

  // 2. Try JSON parsing
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
    try {
      let parsedObj: any = trimmed;
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        parsedObj = JSON.parse(trimmed);
      }
      if (typeof parsedObj === 'string' && parsedObj.startsWith('{')) {
        parsedObj = JSON.parse(parsedObj);
      }
      if (typeof parsedObj === 'string') {
        parsedObj = JSON.parse(parsedObj);
      }

      if (typeof parsedObj === 'object' && parsedObj !== null) {
        // Look for email in explicit fields
        const candidateEmail =
          parsedObj.email ||
          parsedObj.userEmail ||
          parsedObj.studentEmail ||
          parsedObj.emailAddress ||
          parsedObj.studentId ||
          parsedObj.userId ||
          parsedObj.id;

        if (candidateEmail && typeof candidateEmail === 'string') {
          const cleanEmail = candidateEmail.trim().toLowerCase();
          if (isValidEmail(cleanEmail)) {
            return cleanEmail;
          }
        }
      }
    } catch {
      // Ignore JSON parse errors
    }
  }

  // 3. Reject URLs, arbitrary web links
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('/') || trimmed.includes('?')) {
    return null;
  }

  return null;
}

/**
 * Master parser for student QR codes.
 * Returns ParsedStudentQR object if a valid student email can be decoded.
 */
export function parseStudentQR(rawInput: string): ParsedStudentQR | null {
  if (!rawInput || typeof rawInput !== 'string') {
    return null;
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return null;
  }

  const extractedEmail = extractEmailFromQR(trimmed);

  if (extractedEmail) {
    // Attempt to extract additional metadata if JSON
    let version: number | undefined;
    let type: string | undefined;
    let tenantId: string | undefined;
    let studentId: string | undefined;

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const obj = JSON.parse(trimmed);
        version = obj.v ?? obj.version;
        type = obj.type;
        tenantId = obj.tenantId || obj.schoolId;
        studentId = obj.studentId || obj.userId || obj.id;
      } catch {
        // ignore
      }
    }

    return {
      email: extractedEmail,
      studentId: studentId || extractedEmail,
      userId: studentId || extractedEmail,
      version: typeof version === 'number' ? version : 1,
      type: typeof type === 'string' ? type : 'student',
      tenantId,
      raw: trimmed,
    };
  }

  // Legacy fallback: if rawInput is an alphanumeric ID without email (e.g. STU001)
  const isPlainId = /^[a-zA-Z0-9_\-]{3,64}$/.test(trimmed);
  if (isPlainId) {
    return {
      email: trimmed, // treated as identifier for lookup
      studentId: trimmed,
      userId: trimmed,
      version: 1,
      type: 'student',
      raw: trimmed,
    };
  }

  return null;
}
