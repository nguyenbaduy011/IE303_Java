/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpDown,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  RotateCcwKey,
  Search,
  Shield,
  Trash2,
  UserCog,
  Users,
  Briefcase,
  RotateCw, // Added for Restore icon
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { CreateUserDialog } from "@/components/admin/employees/create-user-dialog";
import { EmployeeDetailDialog } from "@/components/admin/employees/employee-detail-dialog";
import { RoleDialog } from "@/components/admin/employees/role-dialog";
import { ResetPasswordDialog } from "@/components/admin/employees/reset-password-alert-dialog";
import { useAuth } from "@/contexts/auth-context";
import {
  EmployeeType,
  fetchEmployees,
} from "@/app/api/get-all-user(admin)/route";
import {
  DepartmentType,
  fetchDepartments,
} from "@/app/api/get-all-departments/route";
import {
  fetchPositions,
  PositionType,
} from "@/app/api/get-all-positions/route";
import {
  fetchRoles,
  RoleWithPermissionsType,
} from "@/app/api/get-all-roles/route";
import {
  TeamWithLeaderType,
  fetchTeams,
} from "@/app/api/get-all-teams(admin)/route";
import { transferEmployeeDepartment } from "@/app/api/change-user-department/route";
import { transferEmployeePosition } from "@/app/api/change-user-position/route";
import { transferEmployeeRole } from "@/app/api/change-user-role/route";
import { transferEmployeeTeam } from "@/app/api/change-user-team/route";
import {
  terminateEmployee,
  TerminateEmployeeResponse,
} from "@/app/api/terminate-user/route";
import { restoreEmployee } from "@/app/api/restore-user/route";

interface TransferFormValues {
  departmentId: string;
  positionId: string;
  roleId: string;
  teamId: string;
  tab: string;
}

const getFullName = (employee: EmployeeType) =>
  `${employee.user?.first_name ?? ""} ${employee.user?.last_name ?? ""}`.trim();

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isNewEmployeeDialogOpen, setIsNewEmployeeDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);
  const [isRestoreLoading, setIsRestoreLoading] = useState(false); // Added for restore loading state
  const { user } = useAuth();

  const [currentEmployee, setCurrentEmployee] = useState<EmployeeType | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [positions, setPositions] = useState<PositionType[]>([]);
  const [roles, setRoles] = useState<RoleWithPermissionsType[]>([]);
  const [teams, setTeams] = useState<TeamWithLeaderType[]>([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [terminateLoading, setTerminateLoading] = useState(false);

  const transferForm = useForm<TransferFormValues>({
    defaultValues: {
      departmentId: "",
      positionId: "",
      roleId: "",
      teamId: "",
      tab: "department",
    },
  });

  const refreshEmployees = async () => {
    try {
      const employeeRes = await fetchEmployees();
      setEmployees(employeeRes);
    } catch (err) {
      console.error("Error refreshing employees:", err); // Improved error logging
      toast.error(
        err instanceof Error ? err.message : "Failed to refresh employee list."
      );
    }
  };

  // Placeholder for restoreEmployee API call

  const handleRestoreEmployee = async (employee: EmployeeType) => {
    setIsRestoreLoading(true);
    try {
      const response = await restoreEmployee(employee.user.id);
      if (response.success) {
        await refreshEmployees();
        toast.success(
          `Employee ${getFullName(employee)} restored successfully.`
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to restore employee. Please try again."
      );
    } finally {
      setIsRestoreLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [employeeRes, departmentRes, positionRes, roleRes, teamRes] =
          await Promise.all([
            fetchEmployees(),
            fetchDepartments(),
            fetchPositions(),
            fetchRoles(),
            fetchTeams(),
          ]);
        const employeeData =
          employeeRes instanceof Response
            ? await employeeRes.json()
            : employeeRes;
        const departmentData =
          departmentRes instanceof Response
            ? await departmentRes.json()
            : departmentRes;
        const positionData =
          positionRes instanceof Response
            ? await positionRes.json()
            : positionRes;
        const roleData =
          roleRes instanceof Response ? await roleRes.json() : roleRes;
        const teamData =
          teamRes instanceof Response ? await teamRes.json() : teamRes;
        setEmployees(employeeData);
        setDepartments(departmentData);
        setPositions(positionData);
        setRoles(roleData);
        setTeams(teamData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      getFullName(employee).toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      employee.position?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.department?.id === selectedDepartment;
    const matchesRole =
      selectedRole === "all" || employee.position?.id === selectedRole;

    return matchesSearch && matchesDepartment && matchesRole;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
    }
  };

  const handleEditEmployee = (employee: EmployeeType) => {
    setCurrentEmployee(employee);
    setIsEmployeeDialogOpen(true);
  };

  const handleManageRole = (employee: EmployeeType) => {
    setCurrentEmployee(employee);
    setIsRoleDialogOpen(true);
  };

  const handleChangePassword = (employee: EmployeeType) => {
    setCurrentEmployee(employee);
    setIsPasswordDialogOpen(true);
  };

  const handleTransferEmployee = (employee: EmployeeType) => {
    setCurrentEmployee(employee);
    setIsTransferDialogOpen(true);
    transferForm.reset({
      departmentId: employee.department?.id || "",
      positionId: employee.position?.id || "",
      roleId: employee.role?.id || "",
      teamId: employee.team?.id || "",
      tab: "department",
    });
  };

  const handleTerminateEmployee = (employee: EmployeeType) => {
    setCurrentEmployee(employee);
    setIsTerminateDialogOpen(true);
  };

  const confirmTerminateEmployee = async () => {
    if (!currentEmployee) return;
    setTerminateLoading(true);
    try {
      const response = await terminateEmployee(currentEmployee.user.id);
      if (response.success) {
        await refreshEmployees();
        toast.success(
          `Employee ${getFullName(currentEmployee)} terminated successfully.`
        );
        setIsTerminateDialogOpen(false);
      }
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to terminate employee. Please try again."
      );
    } finally {
      setTerminateLoading(false);
    }
  };

  const handleTransfer = async (data: TransferFormValues) => {
    if (!currentEmployee) return;
    setTransferLoading(true);
    try {
      let response;
      switch (data.tab) {
        case "department":
          if (!data.departmentId) throw new Error("Department ID is required");
          response = await transferEmployeeDepartment({
            employeeId: currentEmployee.user.id,
            newDepartmentId: data.departmentId,
          });
          break;
        case "position":
          if (!data.positionId) throw new Error("Position ID is required");
          response = await transferEmployeePosition({
            employeeId: currentEmployee.user.id,
            newPositionId: data.positionId,
          });
          break;
        case "role":
          if (!data.roleId) throw new Error("Role ID is required");
          response = await transferEmployeeRole({
            employeeId: currentEmployee.user.id,
            newRoleId: data.roleId,
          });
          break;
        case "team":
          if (!data.teamId) throw new Error("Team ID is required");
          response = await transferEmployeeTeam({
            employeeId: currentEmployee.user.id,
            newTeamId: data.teamId,
          });
          break;
        default:
          throw new Error("Invalid transfer type");
      }
      await refreshEmployees();
      toast.success(`Employee transferred to new ${data.tab} successfully.`);
      setIsTransferDialogOpen(false);
    } catch (err) {
      toast.error("Failed to transfer employee.");
    } finally {
      setTransferLoading(false);
    }
  };

  const renderTableContent = (statusFilter?: string) => (
    <Card className="border-0 shadow-none p-0">
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedEmployees.length === filteredEmployees.length &&
                      filteredEmployees.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all employees"
                  />
                </TableHead>
                <TableHead className="w-[250px]">
                  <div className="flex items-center space-x-2">
                    <span>Employee</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-destructive"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No employees found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees
                  .filter((emp) =>
                    statusFilter ? emp.working_status === statusFilter : true
                  )
                  .map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEmployees.includes(emp.id)}
                          onCheckedChange={(checked) =>
                            handleSelectEmployee(emp.id, !!checked)
                          }
                          aria-label={`Select ${getFullName(emp)}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getFullName(emp)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{getFullName(emp)}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {emp.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{emp.department?.name || "None"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            emp.position?.name?.toLowerCase() === "admin"
                              ? "default"
                              : "outline"
                          }
                        >
                          {emp.position?.name || "None"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`h-2 w-2 rounded-full ${
                              emp.working_status === "active"
                                ? "bg-green-500"
                                : emp.working_status === "inactive"
                                  ? "bg-gray-300"
                                  : "bg-red-500"
                            }`}
                          />
                          {emp.working_status}
                        </div>
                      </TableCell>
                      <TableCell>
                        {emp.team?.name ? (
                          <Badge variant="secondary" className="text-xs">
                            {emp.team.name}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            None
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer"
                              disabled={!emp.user || emp.user.id === user?.id}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {emp.working_status === "terminated" ? (
                              <DropdownMenuItem
                                onClick={() => handleRestoreEmployee(emp)}
                                className="cursor-pointer text-green-600"
                              >
                                <RotateCw className="mr-2 h-4 w-4" />
                                Restore
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleEditEmployee(emp)}
                                  className="cursor-pointer"
                                >
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleChangePassword(emp)}
                                  className="cursor-pointer"
                                >
                                  <RotateCcwKey className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleTransferEmployee(emp)}
                                  className="cursor-pointer"
                                >
                                  <Briefcase className="mr-2 h-4 w-4" />
                                  Transfer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleTerminateEmployee(emp)}
                                  className="text-destructive cursor-pointer"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Terminate
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage employee roles, permissions, and information
          </p>
        </div>
        <Button
          onClick={() => setIsNewEmployeeDialogOpen(true)}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <TabsList>
            <TabsTrigger
              value="all"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Users className="h-4 w-4" />
              All Employees
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Badge
                variant="outline"
                className="h-5 w-5 rounded-full bg-green-500"
              />
              Active
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Badge
                variant="outline"
                className="h-5 w-5 rounded-full bg-gray-300"
              />
              Inactive
            </TabsTrigger>
            <TabsTrigger
              value="terminated"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Badge
                variant="outline"
                className="h-5 w-5 rounded-full bg-red-500"
              />
              Terminated
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-xs font-medium mb-1">Department</p>
                  <Select
                    value={selectedDepartment}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium mb-1">Position</p>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      {positions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" className="cursor-pointer">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="!m-0 !p-0">
          {renderTableContent()}
        </TabsContent>
        <TabsContent value="active" className="!m-0 !p-0">
          {renderTableContent("active")}
        </TabsContent>
        <TabsContent value="inactive" className="!m-0 !p-0">
          {renderTableContent("inactive")}
        </TabsContent>
        <TabsContent value="terminated" className="!m-0 !p-0">
          {renderTableContent("terminated")}
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              Across the organization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Employees
            </CardTitle>
            <Badge
              variant="outline"
              className="h-4 w-4 rounded-full bg-green-500"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                employees.filter((emp) => emp.working_status === "active")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {employees.length > 0
                ? Math.round(
                    (employees.filter((emp) => emp.working_status === "active")
                      .length /
                      employees.length) *
                      100
                  )
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Across the organization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                employees.filter((emp) => emp.role?.name === "SUPER_ADMIN")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              With administrative access
            </p>
          </CardContent>
        </Card>
      </div>

      <CreateUserDialog
        open={isNewEmployeeDialogOpen}
        onOpenChange={setIsNewEmployeeDialogOpen}
        departments={departments}
        positions={positions}
        roles={roles}
        teams={teams}
        onEmployeeCreated={refreshEmployees}
      />

      {currentEmployee && (
        <EmployeeDetailDialog
          open={isEmployeeDialogOpen}
          onOpenChange={setIsEmployeeDialogOpen}
          employee={currentEmployee}
        />
      )}

      {currentEmployee && (
        <RoleDialog
          open={isRoleDialogOpen}
          onOpenChange={setIsRoleDialogOpen}
          employee={currentEmployee}
        />
      )}

      {currentEmployee && (
        <ResetPasswordDialog
          open={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
          employee={currentEmployee}
        />
      )}

      {currentEmployee && (
        <Dialog
          open={isTransferDialogOpen}
          onOpenChange={setIsTransferDialogOpen}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Transfer Employee</DialogTitle>
              <DialogDescription>
                Transfer {getFullName(currentEmployee)} to a new department,
                position, role, or team.
              </DialogDescription>
            </DialogHeader>
            <Tabs
              defaultValue="department"
              className="w-full"
              onValueChange={(value) => transferForm.setValue("tab", value)}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="department">Department</TabsTrigger>
                <TabsTrigger value="position">Position</TabsTrigger>
                <TabsTrigger value="role">Role</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>
              <Form {...transferForm}>
                <form
                  onSubmit={transferForm.handleSubmit(handleTransfer)}
                  className="space-y-6"
                >
                  <TabsContent value="department">
                    <FormField
                      control={transferForm.control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Department</FormLabel>
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
                  </TabsContent>
                  <TabsContent value="position">
                    <FormField
                      control={transferForm.control}
                      name="positionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Position</FormLabel>
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
                  </TabsContent>
                  <TabsContent value="role">
                    <FormField
                      control={transferForm.control}
                      name="roleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Role</FormLabel>
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
                  </TabsContent>
                  <TabsContent value="team">
                    <FormField
                      control={transferForm.control}
                      name="teamId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Team</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select team" />
                              </SelectTrigger>
                              <SelectContent>
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
                  </TabsContent>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsTransferDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      type="submit"
                      disabled={transferLoading}
                      loading={transferLoading}
                    >
                      {transferLoading ? "Transferring..." : "Transfer"}
                    </LoadingButton>
                  </DialogFooter>
                </form>
              </Form>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {currentEmployee && (
        <Dialog
          open={isTerminateDialogOpen}
          onOpenChange={setIsTerminateDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Terminate Employee</DialogTitle>
              <DialogDescription>
                Are you sure you want to terminate{" "}
                {getFullName(currentEmployee)}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTerminateDialogOpen(false)}
              >
                Cancel
              </Button>
              <LoadingButton
                type="button"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={terminateLoading}
                loading={terminateLoading}
                onClick={confirmTerminateEmployee}
              >
                {terminateLoading ? "Terminating..." : "Terminate"}
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
