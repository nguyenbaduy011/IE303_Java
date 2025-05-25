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


export const profileFormSchema = z.object({
  first_name: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  last_name: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  birth_date: z.string(),
  nationality: z.string().optional(),
  gender: z.enum(["male", "female"]),
  bio: z.string().optional(),
  skills: z.string().optional(),
  education: z.string().optional(),
  certifications: z.string().optional(),
  languages: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;