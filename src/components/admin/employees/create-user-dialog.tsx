/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { User, Briefcase, DollarSign, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  createEmployee,
  CreateEmployeePayload,
} from "@/app/api/create-user/route";
import { DepartmentType } from "@/app/api/get-all-departments/route";
import { PositionType } from "@/app/api/get-all-positions/route";
import { RoleWithPermissionsType } from "@/app/api/get-all-roles/route";
import { TeamWithLeaderType } from "@/app/api/get-all-teams(admin)/route";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: DepartmentType[];
  positions: PositionType[];
  roles: RoleWithPermissionsType[];
  teams: TeamWithLeaderType[];
  onEmployeeCreated: () => void;
}

// Định nghĩa schema UUID với thông báo lỗi
const uuidSchema = z.string().uuid("Invalid UUID format");

// Định nghĩa schema cho nhân viên
const employeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .refine((date) => new Date(date) < new Date(), {
      message: "Birth date must be in the past",
    }),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  nationality: z.string().nullable(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits"),
  address: z.string().nullable(),
  imageUrl: z
    .string()
    .url("Invalid URL")
    .nullable()
    .or(z.literal("").transform(() => null)),
  hireDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .refine((date) => new Date(date) <= new Date(), {
      message: "Hire date must be today or in the past",
    }),
  positionId: uuidSchema,
  departmentId: uuidSchema,
  teamId: uuidSchema.nullable(),
  roleId: uuidSchema,
  salary: z.number().gt(0, "Salary must be greater than 0"),
  workingStatus: z.literal("active"),
});

export function CreateUserDialog({
  open,
  onOpenChange,
  departments = [],
  positions = [],
  roles = [],
  teams = [],
  onEmployeeCreated,
}: CreateUserDialogProps) {
  // Khởi tạo form với schema và giá trị mặc định
  const form = useForm<CreateEmployeePayload>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      birthDate: "",
      gender: "male",
      nationality: null,
      phoneNumber: "",
      address: null,
      imageUrl: null,
      hireDate: "",
      positionId: "",
      departmentId: "",
      teamId: null,
      roleId: "",
      salary: 0.01,
      workingStatus: "active",
    },
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  // Xử lý khi submit form
  const onSubmit = async (data: CreateEmployeePayload) => {
    setLoading(true);
    try {
      console.log("Payload gửi đi:", data);
      const payload = {
        ...data,
        gender: data.gender as "male" | "female",
        workingStatus: data.workingStatus as "active",
      };
      await createEmployee(payload);
      toast.success("Employee created successfully!");
      form.reset();
      onEmployeeCreated();
      onOpenChange(false);
      setActiveTab("personal");
    } catch (error: any) {
      console.error("Lỗi khi gửi:", error);
      const errorData = error.message ? await JSON.parse(error.message) : null;
      const errorMessage = errorData?.errors
        ? errorData.errors.map((e: any) => e.message).join(", ")
        : error.message || "Unexpected error while creating employee";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Kiểm tra tính hợp lệ của tab
  const isTabValid = (tabName: string) => {
    const errors = form.formState.errors;
    switch (tabName) {
      case "personal":
        return (
          !errors.firstName &&
          !errors.lastName &&
          !errors.email &&
          !errors.birthDate &&
          !errors.gender &&
          !errors.phoneNumber
        );
      case "employment":
        return (
          !errors.hireDate &&
          !errors.positionId &&
          !errors.departmentId &&
          !errors.teamId &&
          !errors.roleId
        );
      case "compensation":
        return !errors.salary && !errors.workingStatus;
      default:
        return true;
    }
  };

  // Kiểm tra nếu không có dữ liệu phòng ban, vị trí, hoặc vai trò
  if (!departments.length || !positions.length || !roles.length) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Cannot create employee: No departments, positions, or roles
              available.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[85vh]">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Add New Employee
          </DialogTitle>
          <DialogDescription>
            Complete the employee information across the sections below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="personal"
                  className="flex items-center gap-1.5"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Personal</span>
                  {!isTabValid("personal") && (
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="employment"
                  className="flex items-center gap-1.5"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Employment</span>
                  {!isTabValid("employment") && (
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="compensation"
                  className="flex items-center gap-1.5"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Compensation</span>
                  {!isTabValid("compensation") && (
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[500px] mt-4">
                <TabsContent value="personal" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Basic personal details and contact information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Doe" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="john.doe@company.com"
                                type="email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="birthDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Birth Date *</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender *</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">
                                      Female
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="nationality"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nationality</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Vietnam"
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="0123456789"
                                  type="tel"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="123 Main Street, Hanoi"
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Image URL</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://example.com/images/john.jpg"
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="employment" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Employment Details
                      </CardTitle>
                      <CardDescription>
                        Job position, department, and team assignments
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="hireDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hire Date *</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="departmentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department *</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {departments.map((dept) => (
                                      <SelectItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="positionId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position *</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select position" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {positions.map((pos) => (
                                      <SelectItem key={pos.id} value={pos.id}>
                                        {pos.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="teamId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Team</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value ?? undefined}
                                  onValueChange={(value) =>
                                    field.onChange(
                                      value === "null" ? null : value
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select team" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="null">None</SelectItem>
                                    {teams.map((team) => (
                                      <SelectItem key={team.id} value={team.id}>
                                        {team.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="roleId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role *</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map((role) => (
                                      <SelectItem key={role.id} value={role.id}>
                                        {role.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="compensation" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Compensation & Status
                      </CardTitle>
                      <CardDescription>
                        Salary information and employment status
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Annual Salary *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(Number(e.target.value))
                                  }
                                  placeholder="5000.00"
                                  className="pl-9"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="workingStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Working Status *</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Additional Settings
                      </CardTitle>
                      <CardDescription>
                        Optional configurations and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>
                          Additional settings will be available here in future
                          updates.
                        </p>
                        <p className="text-sm mt-2">
                          For now, you can proceed to create the employee.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <Separator />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating Employee..." : "Create Employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
