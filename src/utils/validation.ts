/**
 * Input sanitization & strict field validation helpers for Aftab Clinic portal
 */

/**
 * Strip numbers and special characters from Name fields (allows letters, spaces, dots, and hyphens only)
 */
export const sanitizeNameInput = (val: string): string => {
  return val.replace(/[^a-zA-Z\s.-]/g, '');
};

/**
 * Strip letters from Phone fields (allows digits 0-9, plus +, hyphens -, and spaces only)
 */
export const sanitizePhoneInput = (val: string): string => {
  return val.replace(/[^0-9+\-\s]/g, '');
};

/**
 * Strip non-digits from Age or integer fields (digits 0-9 only)
 */
export const sanitizeDigitsOnly = (val: string): string => {
  return val.replace(/[^0-9]/g, '');
};

/**
 * Strip letters from Price / Amount / Decimal fields (digits 0-9 and decimal point)
 */
export const sanitizeNumericDecimal = (val: string): string => {
  const cleaned = val.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
};

/**
 * Validate Pakistani & International phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 10 && digits.length <= 13;
};

/**
 * Validate person full name (at least 2 letters, no numbers)
 */
export const isValidFullName = (name: string): boolean => {
  const trimmed = name.trim();
  const nameRegex = /^[a-zA-Z\s.-]{2,50}$/;
  return nameRegex.test(trimmed);
};
