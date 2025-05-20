// ~/lib/validations.ts
import { z } from "zod";

export const workingStatusEnum = z.enum(["active", "inactive", "terminated"]);

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
export type WorkingStatus = z.infer<typeof workingStatusEnum>;

export const addMemberSchema = z.object({
  user_id: z.string().min(1, "Please select a user"),
  message: z.string().optional(),
});

export type AddMemberForm = z.infer<typeof addMemberSchema>;