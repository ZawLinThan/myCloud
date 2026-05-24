import { z } from 'zod';

export const authFormSchema = z
  .object({
    type: z.enum(['sign-in', 'sign-up']),
    email: z
      .string()
      .min(1, 'Email is required.')
      .email('Invalid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    fullName: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'sign-up' && !value.fullName?.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Full name is required.',
        path: ['fullName'],
      });
    }
  });

export type AuthFormValues = z.infer<typeof authFormSchema>;
