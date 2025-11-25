import { VDA_RULES, ValidationRule } from '../types';

export const validateVDAField = (fieldName: string, value: string | number): string | null => {
  const rule = VDA_RULES[fieldName];
  if (!rule) return null; // No rule defined

  const strVal = String(value);

  if (rule.required && !strVal) {
    return 'Bu alan zorunludur.';
  }

  if (rule.maxLength && strVal.length > rule.maxLength) {
    return `Maksimum ${rule.maxLength} karakter olmalıdır. (Şu an: ${strVal.length})`;
  }

  if (rule.numericOnly && !/^\d*$/.test(strVal)) {
    return 'Sadece rakam girilebilir.';
  }

  return null;
};

export const getNextSerial = (current: number): string => {
  // VDA serials typically need to be unique per year/customer.
  // Standard format often 9 digits.
  // We increment and pad.
  const next = current + 1;
  return next.toString().padStart(9, '0');
};

export const formatWeight = (val: number): string => {
  return val.toFixed(0); // VDA usually expects integer kg, but varies by OEM
};
