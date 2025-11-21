import { z } from 'zod';

export const signupSchema = z
  .object({
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
    password: z
      .string()
      .min(1, { error: 'يجب إدخال كلمة سر' })
      .min(8, { error: 'كلمة السر لا تستوفي الشروط المطلوبة' })
      .regex(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,64})/, {
        error: 'كلمة السر لا تستوفي الشروط المطلوبة',
      }),
    confirmPassword: z.string().min(1, { error: 'يجب تأكيد كلمة السر' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'كلمتا السر غير متطابقتان',
    path: ['confirmPassword'],
  });

export type SignupValues = z.infer<typeof signupSchema>;
