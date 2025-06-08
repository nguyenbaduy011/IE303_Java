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

const uuidSchema = z.string().uuid("Định dạng UUID không hợp lệ");

const employeeSchema = z.object({
  firstName: z.string().min(1, "Họ không được để trống"),
  lastName: z.string().min(1, "Tên không được để trống"),
  email: z.string().email("Địa chỉ email không hợp lệ"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày không hợp lệ (YYYY-MM-DD)")
    .refine((date) => new Date(date) < new Date(), {
      message: "Ngày sinh phải trong quá khứ",
    }),
  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Vui lòng chọn giới tính" }),
  }),
  nationality: z.string().nullable(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Số điện thoại phải có 10-15 chữ số"),
  address: z.string().nullable(),
  imageUrl: z
    .string()
    .url("URL không hợp lệ")
    .nullable()
    .or(z.literal("").transform(() => null)),
  hireDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày không hợp lệ (YYYY-MM-DD)")
    .refine((date) => new Date(date) <= new Date(), {
      message: "Ngày bắt đầu làm việc phải là hôm nay hoặc trong quá khứ",
    }),
  positionId: uuidSchema,
  departmentId: uuidSchema,
  teamId: uuidSchema.nullable(),
  roleId: uuidSchema,
  salary: z.number().gt(0, "Lương phải lớn hơn 0"),
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
      toast.success("Tạo nhân viên thành công!");
      form.reset();
      onEmployeeCreated();
      onOpenChange(false);
      setActiveTab("personal");
    } catch (error: any) {
      console.error("Lỗi khi gửi:", error);
      const errorData = error.message ? await JSON.parse(error.message) : null;
      const errorMessage = errorData?.errors
        ? errorData.errors.map((e: any) => e.message).join(", ")
        : error.message || "Lỗi không xác định khi tạo nhân viên";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

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

  if (!departments.length || !positions.length || !roles.length) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[750px]">
          <DialogHeader>
            <DialogTitle>Lỗi</DialogTitle>
            <DialogDescription>
              Không thể tạo nhân viên: Không có phòng ban, vị trí hoặc vai trò
              nào khả dụng.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
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
            Thêm Nhân Viên Mới
          </DialogTitle>
          <DialogDescription>
            Điền đầy đủ thông tin nhân viên qua các phần bên dưới.
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
                  <span className="hidden sm:inline">Cá Nhân</span>
                  {!isTabValid("personal") && (
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="employment"
                  className="flex items-center gap-1.5"
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Công Việc</span>
                  {!isTabValid("employment") && (
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="compensation"
                  className="flex items-center gap-1.5"
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Lương</span>
                  {!isTabValid("compensation") && (
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Cài Đặt</span>
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[500px] mt-4">
                <TabsContent value="personal" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Thông Tin Cá Nhân
                      </CardTitle>
                      <CardDescription>
                        Thông tin cá nhân cơ bản và liên hệ
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Họ *</FormLabel>
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
                              <FormLabel>Tên *</FormLabel>
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
                            <FormLabel>Địa Chỉ Email *</FormLabel>
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
                              <FormLabel>Ngày Sinh *</FormLabel>
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
                              <FormLabel>Giới Tính *</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn giới tính" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="male">Nam</SelectItem>
                                    <SelectItem value="female">Nữ</SelectItem>
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
                              <FormLabel>Quốc Tịch</FormLabel>
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
                              <FormLabel>Số Điện Thoại *</FormLabel>
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
                            <FormLabel>Địa Chỉ</FormLabel>
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
                            <FormLabel>URL Ảnh Hồ Sơ</FormLabel>
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
                        Chi Tiết Công Việc
                      </CardTitle>
                      <CardDescription>
                        Vị trí công việc, phòng ban và phân công team
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="hireDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ngày Bắt Đầu Làm Việc *</FormLabel>
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
                              <FormLabel>Phòng Ban *</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn phòng ban" />
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
                              <FormLabel>Vị Trí *</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn vị trí" />
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
                                    <SelectValue placeholder="Chọn team" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="null">
                                      Không có
                                    </SelectItem>
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
                              <FormLabel>Vai Trò *</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn vai trò" />
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
                        Lương & Trạng Thái
                      </CardTitle>
                      <CardDescription>
                        Thông tin lương và trạng thái làm việc
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lương Hàng Năm *</FormLabel>
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
                            <FormLabel>Trạng Thái Làm Việc *</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">
                                    Đang Làm
                                  </SelectItem>
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
                      <CardTitle className="text-lg">Cài Đặt Bổ Sung</CardTitle>
                      <CardDescription>
                        Cấu hình và tùy chọn bổ sung
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>
                          Các cài đặt bổ sung sẽ được thêm vào đây trong các bản
                          cập nhật sau.
                        </p>
                        <p className="text-sm mt-2">
                          Hiện tại, bạn có thể tiếp tục tạo nhân viên.
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
                Hủy
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang Tạo Nhân Viên..." : "Tạo Nhân Viên"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
