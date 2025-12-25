import { STUDENT_ROLE, SUPERVISOR_ROLE } from '@/types/types';
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(1, { error: 'يجب إدخال كلمة سر' })
  .min(8, { error: 'كلمة السر لا تستوفي الشروط المطلوبة' })
  .regex(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,64})/, {
    error: 'كلمة السر لا تستوفي الشروط المطلوبة',
  });

export const userSchema = z.object({
  firstName: z
    .string()
    .min(1, { error: 'يجب إدخال الاسم الأول' })
    .min(2, { error: 'يجب أن يكون الاسم الأول حرفين على الأقل' })
    .max(50, { error: 'يجب ألا يزيد الاسم الأول عن ٢٠ حرفًا' }),
  middleName: z
    .string()
    .min(1, { error: 'يجب إدخال اسم الأب' })
    .min(3, { error: 'يجب أن يكون اسم الأب ثلاث حروف على الأقل' })
    .max(50, { error: 'يجب ألا يزيد اسم الأب عن ٢٠ حرفًا' }),
  lastName: z
    .string()
    .min(1, { error: 'يجب إدخال اسم العائلة' })
    .min(3, { error: 'يجب أن يكون اسم العائلة ثلاث حروف على الأقل' })
    .max(50, { error: 'يجب ألا يزيد اسم العائلة عن ٣٠ حرفًا' }),
  email: z.email({ error: 'يجب إدخال بريد إلكتروني صحيح وفعّال' }),
  birthYear: z.coerce
    .number({ error: 'يجب إدخال سنة الميلاد' })
    .min(1900, { error: 'سنة الميلاد غير صحيحة' })
    .max(new Date().getFullYear(), { error: 'سنة الميلاد غير صحيحة' }),
  password: passwordSchema,
});

export const signupSchema = userSchema
  .extend({
    confirmPassword: z.string().min(1, { error: 'يجب تأكيد كلمة السر' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'كلمتا السر غير متطابقتان',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.email({ error: 'يجب إدخال بريد إلكتروني صحيح' }),
  password: z.string().min(1, { error: 'يجب إدخال كلمة السر' }),
});

export const createUserSchema = z.object({
  firstName: z.string('الاسم الأول مطلوب').min(2, 'الاسم الأول مطلوب'),
  middleName: z.string('الاسم الثاني مطلوب').min(2, 'الاسم الثاني مطلوب'),
  lastName: z.string('اسم العائلة مطلوب').min(2, 'اسم العائلة مطلوب'),
  birthYear: z
    .number('سنة الميلاد مطلوبة')
    .min(1900, 'سنة الميلاد غير صحيحة')
    .max(new Date().getFullYear() - 11, 'سنة الميلاد غير صحيحة'),
  cohortId: z.string('الدفعة مطلوبة').min(1, 'الدفعة مطلوبة').optional(),
  country: z.string('الدولة مطلوبة').length(2, 'الدولة مطلوبة'),
  role: z.enum([STUDENT_ROLE, SUPERVISOR_ROLE], 'الرتبة مطلوبة'),
});

export const invitedUserSchema = z
  .object({
    email: z.email({ error: 'يجب إدخال بريد إلكتروني صحيح وفعّال' }),
    password: z
      .string('يجب إدخال كلمة سر')
      .min(1, { error: 'يجب إدخال كلمة سر' })
      .min(8, { error: 'كلمة السر لا تستوفي الشروط المطلوبة' })
      .regex(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,64})/, {
        error: 'كلمة السر لا تستوفي الشروط المطلوبة',
      }),
    confirmPassword: z
      .string('يجب تأكيد كلمة السر')
      .min(1, { error: 'يجب تأكيد كلمة السر' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'كلمتا السر غير متطابقتان',
    path: ['confirmPassword'],
  });

export type CreateUserData = z.infer<typeof createUserSchema>;
export type InvitedUserData = z.infer<typeof invitedUserSchema>;

export type UserData = z.infer<typeof userSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
