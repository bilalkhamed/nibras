import { UserDTO } from '@/features/users/types';
import { NavItem } from '@/types/types';
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

export function generateSixCharCode() {
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
    month: 'numeric',
    day: 'numeric',
  });
}

export function getVisibleNavItems(items: NavItem[], user: UserDTO | null) {
  return items.filter((item) => {
    if (item.auth && !user) return false;
    if (item.role && user?.role !== item.role) return false;
    return true;
  });
}

export function toArabicNumerals(input: string | number) {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return input
    .toString()
    .split('')
    .map((char) =>
      /\d/.test(char) ? arabicNumerals[parseInt(char, 10)] : char,
    )
    .join('');
}
