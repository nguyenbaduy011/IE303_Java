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
export const PasswordSchema = z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must be at least 8 characters",
      path: ["length"],
    });
  }
  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must contain at least one uppercase letter",
      path: ["uppercase"],
    });
  }
  if (!/[a-z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must contain at least one lowercase letter",
      path: ["lowercase"],
    });
  }
  if (!/[0-9]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must contain at least one number",
      path: ["number"],
    });
  }
  if (!/[^A-Za-z0-9]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must contain at least one special character",
      path: ["special"],
    });
  }
});

  export type PasswordForm = z.infer<typeof PasswordSchema>;
