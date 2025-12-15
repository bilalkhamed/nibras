import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRole(role: string) {
  if (role === 'admin') return 'مديرة النظام';
  if (role === 'supervisor') return 'مشرفة';
  if (role === 'student') return 'طالبة';
  return role;
}

export function generateGroupCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const array = new Uint32Array(6);
  crypto.getRandomValues(array);
  for (let i = 0; i < array.length; i++) {
    code += chars[array[i] % chars.length];
  }
  return code;
}

export function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
