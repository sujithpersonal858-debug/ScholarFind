/**
 * Form field validation helpers
 */

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email address is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return '';
}

export function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

export function validateMarks(marks) {
  if (marks === '' || marks === null || marks === undefined) return '';
  const num = Number(marks);
  if (isNaN(num) || num < 0 || num > 100) {
    return 'Marks must be a valid percentage between 0 and 100.';
  }
  return '';
}

export function validateIncome(income) {
  if (income === '' || income === null || income === undefined) return '';
  const num = Number(income);
  if (isNaN(num) || num < 0) {
    return 'Annual income must be a non-negative number.';
  }
  return '';
}
