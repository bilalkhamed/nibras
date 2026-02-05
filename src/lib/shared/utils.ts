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

/**
 * Get the public URL for a file in the public S3 bucket (Tigris)
 * Uses subdomain-style URL: https://<bucket>.t3.storage.dev/<key>
 * This is a pure function that doesn't import any server modules.
 */
export function getPublicS3Url(key: string): string {
  // Server-side uses PUBLIC_AWS_BUCKET_NAME, client-side uses NEXT_PUBLIC_S3_PUBLIC_BUCKET
  const bucket =
    process.env.PUBLIC_AWS_BUCKET_NAME ??
    process.env.NEXT_PUBLIC_S3_PUBLIC_BUCKET ??
    'nebras-public';
  return `https://${bucket}.t3.storage.dev/${key}`;
}
