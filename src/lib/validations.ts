// ~/lib/validations.ts
import { z } from "zod";

export const workingStatusEnum = z.enum(["active", "inactive", "terminated"]);

export type WorkingStatus = z.infer<typeof workingStatusEnum>;


export const employeeSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  department: z.string().min(1, "Department is required"),
  role: z.string().min(1, "Role is required"),
  working_status: workingStatusEnum,
  start_date: z.date().optional().nullable(), //  <─ thêm optional | nullable
  phone_number: z
    .string()
    .regex(/^\+?\d{9,15}$/, "Invalid phone number")
    .optional(),
  address: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;


export const addMemberSchema = z.object({
  user_id: z.string().min(1, "Please select a user"),
  message: z.string().optional(),
});

export type AddMemberForm = z.infer<typeof addMemberSchema>;


// Schema for profile form validation
export const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  nationality: z.string().optional(),
  gender: z.enum(["male", "female"], {
    required_error: "Gender is required",
  }),
  bio: z.string().optional(),
});

export type ProfileForm = z.infer<typeof profileFormSchema>;

// Schema for password form validation
export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  export type ChangePasswordForm = z.infer<typeof changePasswordFormSchema>;
