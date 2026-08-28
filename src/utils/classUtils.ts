/**
 * Safe normalizer for student.classIds attribute.
 * Supports string arrays (["class 10"]), DynamoDB attribute objects ([{ S: "class 10" }]), or single strings.
 */
export function normalizeClassIds(classIds: any): string[] {
  if (!classIds) return [];

  const rawArray = Array.isArray(classIds) ? classIds : [classIds];

  return rawArray
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim().toLowerCase();
      }
      if (item && typeof item === 'object' && typeof item.S === 'string') {
        return item.S.trim().toLowerCase();
      }
      if (item && typeof item === 'object' && typeof item.value === 'string') {
        return item.value.trim().toLowerCase();
      }
      return null;
    })
    .filter((val): val is string => Boolean(val));
}

/**
 * Checks whether a student entity belongs to a target selected class.
 * Compares selectedClass (e.g. "Class 10", "class-10", "class 10") against student.classIds.
 */
export function studentBelongsToClass(student: any, selectedClass: string): boolean {
  if (!selectedClass || !student) return false;

  const rawClassIds = normalizeClassIds(student.classIds);

  // Fallback to student.classId or student.gradeLevel if classIds array is missing
  if (rawClassIds.length === 0) {
    if (student.classId) rawClassIds.push(String(student.classId).trim().toLowerCase());
    if (student.gradeLevel) rawClassIds.push(String(student.gradeLevel).trim().toLowerCase());
  }

  if (rawClassIds.length === 0) return false;

  const targetRaw = String(selectedClass).trim().toLowerCase();
  const targetClean = targetRaw.replace(/[-_]/g, ' ').replace(/\s+/g, ' '); // "class 10"
  const targetDash = targetRaw.replace(/\s+/g, '-'); // "class-10"
  const targetNumOnly = targetClean.replace(/^(class|grade|btech)\s*/i, '').trim(); // "10"

  return rawClassIds.some((cId) => {
    const cClean = cId.replace(/[-_]/g, ' ').replace(/\s+/g, ' ');
    const cDash = cId.replace(/\s+/g, '-');
    const cNumOnly = cClean.replace(/^(class|grade|btech)\s*/i, '').trim();

    if (cId === targetRaw || cClean === targetClean || cDash === targetDash) {
      return true;
    }

    if (targetNumOnly && cNumOnly && targetNumOnly === cNumOnly) {
      return true;
    }

    return false;
  });
}
