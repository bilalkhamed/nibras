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
