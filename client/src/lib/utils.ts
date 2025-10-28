import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 將學號格式化為四位數（補齊前導零）
 */
export function formatStudentId(studentId: string | number): string {
  const value = typeof studentId === 'number' ? studentId.toString() : (studentId ?? '').toString();
  const trimmed = value.trim();
  if (trimmed === '') {
    return '';
  }
  return trimmed.padStart(4, '0');
}
