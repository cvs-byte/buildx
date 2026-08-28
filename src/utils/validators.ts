export const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  return { isValid: true };
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Optional
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone.replace(/[\s-()]/g, ''));
};

export interface FormErrorState {
  [key: string]: string;
}

export const validateUserForm = (data: Record<string, any>, role: string): FormErrorState => {
  const errors: FormErrorState = {};

  if (!data.firstName || !data.firstName.trim()) {
    errors.firstName = 'First name is required.';
  }

  if (!data.lastName || !data.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number.';
  }

  // Role specific validations
  if (role === 'TEACHER') {
    if (!data.department || !data.department.trim()) {
      errors.department = 'Department is required for Teachers.';
    }
    if (!data.subjectSpecialization || !data.subjectSpecialization.trim()) {
      errors.subjectSpecialization = 'Subject specialization is required.';
    }
  }

  if (role === 'STUDENT') {
    if (!data.rollNumber || !data.rollNumber.trim()) {
      errors.rollNumber = 'Roll number is required for Students.';
    }
    if (!data.gradeLevel || !data.gradeLevel.trim()) {
      errors.gradeLevel = 'Grade / Class level is required.';
    }
  }

  return errors;
};
