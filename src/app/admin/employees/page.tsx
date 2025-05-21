"use client";

import { useState } from "react";
import {
  ArrowUpDown,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { PermissionType, UserFullShape } from "@/types/types";
import { departments, mockEmployees, roles } from "@/data/mock-data";
import { getFullName } from "@/utils/getFullName";
import { EmployeeDetailDialog } from "@/components/admin/employees/employee-detail-dialog";
import { RoleDialog } from "@/components/admin/employees/role-dialog";

export default function EmployeeManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<UserFullShape | null>(
    null
  );

  const filteredEmployees = mockEmployees.filter((employee) => {
    const matchesSearch =
      getFullName(employee).toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      employee.role.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.department.id === selectedDepartment;
    const matchesRole =
      selectedRole === "all" || employee.role.id === selectedRole;

    return matchesSearch && matchesDepartment && matchesRole;
  });

  //Mảng tách tên của departments cho combobox
  // const departments = Array.from(
  //   new Set(mockEmployees.map((emp) => emp.department))
  // );
  //Mảng tách tên của rolé cho combobox
  // const roles = Array.from(new Set(mockEmployees.map((emp) => emp.role)));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      // Tick vào ô của một nhân viên
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      // Bỏ tick
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
    }
  };

  // Open employee dialog with selected employee data
  const handleEditEmployee = (employee: UserFullShape) => {
    setCurrentEmployee(employee);
    setIsEmployeeDialogOpen(true);
  };

  // Open role dialog with selected employee data
  const handleManageRole = (employee: UserFullShape) => {
    setCurrentEmployee(employee);
    setIsRoleDialogOpen(true);
  };

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
          onClick={() => {
            setCurrentEmployee(null);
            setIsEmployeeDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Employees
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="h-5 w-5 rounded-full bg-green-500"
              />
              Active
            </TabsTrigger>
            <TabsTrigger value="inactive" className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="h-5 w-5 rounded-full bg-gray-300"
              />
              Inactive
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
                    <SelectTrigger className="w-full">
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
                  <p className="text-xs font-medium mb-1">Role</p>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
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
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            selectedEmployees.length ===
                              filteredEmployees.length &&
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
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No employees found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees.map((emp) => (
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
                                <AvatarImage
                                  src={emp.image_url || "/placeholder.svg"}
                                  alt={getFullName(emp)}
                                />
                                <AvatarFallback>
                                  {getFullName(emp)
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {getFullName(emp)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {emp.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{emp.department.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  emp.role.name === "admin"
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {emp.role.name}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`h-2 w-2 rounded-full ${
                                  emp.employment.working_status === "active"
                                    ? "bg-green-500"
                                    : emp.employment.working_status ===
                                      "inactive"
                                    ? "bg-gray-300"
                                    : "bg-red-200"
                                }`}
                              />
                              {emp.employment.working_status}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {emp.role.permissions.map(
                                (permission: PermissionType, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {permission.name}
                                  </Badge>
                                )
                              )}
                              {emp.role.permissions.length === 0 && (
                                <span className="text-sm text-muted-foreground">
                                  None
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleEditEmployee(emp)}
                                >
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleManageRole(emp)}
                                >
                                  <Users className="mr-2 h-4 w-4" />
                                  Manage Role
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
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
        </TabsContent>
        <TabsContent value="active" className="!m-0 !p-0">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            selectedEmployees.length ===
                              filteredEmployees.length &&
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
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.filter(
                      (emp) => emp.employment.working_status === "active"
                    ).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No active employees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees
                        .filter(
                          (emp) => emp.employment.working_status === "active"
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
                                  <AvatarImage
                                    src={emp.image_url || "/placeholder.svg"}
                                    alt={getFullName(emp)}
                                  />
                                  <AvatarFallback>
                                    {getFullName(emp)
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {getFullName(emp)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {emp.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{emp.department.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    emp.role.name === "admin"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {emp.role.name}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`h-2 w-2 rounded-full ${
                                    emp.employment.working_status === "active"
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                />
                                {emp.employment.working_status}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {emp.role.permissions.map(
                                  (
                                    permission: PermissionType,
                                    index: number
                                  ) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {permission.name}
                                    </Badge>
                                  )
                                )}
                                {emp.role.permissions.length === 0 && (
                                  <span className="text-sm text-muted-foreground">
                                    None
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleEditEmployee(emp)}
                                  >
                                    <UserCog className="mr-2 h-4 w-4" />
                                    Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleManageRole(emp)}
                                  >
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Role
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
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
        </TabsContent>
        <TabsContent value="inactive" className="!m-0 !p-0">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            selectedEmployees.length ===
                              filteredEmployees.length &&
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
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.filter(
                      (emp) => emp.employment.working_status === "inactive"
                    ).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No inactive employees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees
                        .filter(
                          (emp) => emp.employment.working_status === "inactive"
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
                                  <AvatarImage
                                    src={emp.image_url || "/placeholder.svg"}
                                    alt={getFullName(emp)}
                                  />
                                  <AvatarFallback>
                                    {getFullName(emp)
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {getFullName(emp)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {emp.email}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{emp.department.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    emp.role.name === "admin"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {emp.role.name}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`h-2 w-2 rounded-full ${
                                    emp.employment.working_status === "active"
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                />
                                {emp.employment.working_status}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {emp.role.permissions.map(
                                  (
                                    permission: PermissionType,
                                    index: number
                                  ) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {permission.name}
                                    </Badge>
                                  )
                                )}
                                {emp.role.permissions.length === 0 && (
                                  <span className="text-sm text-muted-foreground">
                                    None
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleEditEmployee(emp)}
                                  >
                                    <UserCog className="mr-2 h-4 w-4" />
                                    Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleManageRole(emp)}
                                  >
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Role
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
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
        </TabsContent>
      </Tabs>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEmployees.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 in the last month
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
                mockEmployees.filter(
                  (emp) => emp.employment.working_status === "active"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(
                (mockEmployees.filter(
                  (emp) => emp.employment.working_status === "active"
                ).length /
                  mockEmployees.length) *
                  100
              )}
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
              {mockEmployees.filter((emp) => emp.role.name === "admin").length}
            </div>
            <p className="text-xs text-muted-foreground">
              With administrative access
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Employee Dialog */}
      {currentEmployee && (
        <EmployeeDetailDialog
          open={isEmployeeDialogOpen}
          onOpenChange={setIsEmployeeDialogOpen}
          employee={currentEmployee}
        />
      )}

      {/* Role Dialog */}
      {currentEmployee && (
        <RoleDialog
          open={isRoleDialogOpen}
          onOpenChange={setIsRoleDialogOpen}
          employee={currentEmployee}
        />
      )}
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import {
//   ArrowUpDown,
//   Download,
//   Filter,
//   MoreHorizontal,
//   Plus,
//   Search,
//   Shield,
//   Trash2,
//   UserCog,
//   Users,
// } from "lucide-react";

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { PermissionType, UserFullShape } from "@/types/types";
// import { departments, mockEmployees, roles } from "@/app/data/mock-data";
// import { getFullName } from "@/utils/getFullName";
// import { EmployeeDetailDialog } from "@/components/admin/employees/employee-detail-dialog";
// import { RoleDialog } from "@/components/admin/employees/role-dialog";

// export default function EmployeeManagementPage() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
//   const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
//   const [selectedRole, setSelectedRole] = useState<string>("all");
//   const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
//   const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
//   const [currentEmployee, setCurrentEmployee] = useState<UserFullShape | null>(
//     null
//   );

//   const filteredEmployees = mockEmployees.filter((employee) => {
//     const matchesSearch =
//       getFullName(employee).toLowerCase().includes(searchQuery.toLowerCase()) ||
//       employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       employee.department.name
//         .toLowerCase()
//         .includes(searchQuery.toLowerCase()) ||
//       employee.role.name.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesDepartment =
//       selectedDepartment === "all" ||
//       employee.department.id === selectedDepartment;
//     const matchesRole =
//       selectedRole === "all" || employee.role.id === selectedRole;

//     return matchesSearch && matchesDepartment && matchesRole;
//   });

//   //Mảng tách tên của departments cho combobox
//   // const departments = Array.from(
//   //   new Set(mockEmployees.map((emp) => emp.department))
//   // );
//   //Mảng tách tên của rolé cho combobox
//   // const roles = Array.from(new Set(mockEmployees.map((emp) => emp.role)));

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       setSelectedEmployees(filteredEmployees.map((emp) => emp.id));
//     } else {
//       setSelectedEmployees([]);
//     }
//   };

//   const handleSelectEmployee = (employeeId: string, checked: boolean) => {
//     if (checked) {
//       // Tick vào ô của một nhân viên
//       setSelectedEmployees([...selectedEmployees, employeeId]);
//     } else {
//       // Bỏ tick
//       setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
//     }
//   };

//   // Open employee dialog with selected employee data
//   const handleEditEmployee = (employee: UserFullShape) => {
//     setCurrentEmployee(employee);
//     setIsEmployeeDialogOpen(true);
//   };

//   // Open role dialog with selected employee data
//   const handleManageRole = (employee: UserFullShape) => {
//     setCurrentEmployee(employee);
//     setIsRoleDialogOpen(true);
//   };

//   return (
//     <div className="container mx-auto py-8">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-3xl font-bold">Employee Management</h1>
//           <p className="text-muted-foreground mt-1">
//             Manage employee roles, permissions, and information
//           </p>
//         </div>
//         <Button
//           onClick={() => {
//             setCurrentEmployee(null);
//             setIsEmployeeDialogOpen(true);
//           }}
//         >
//           <Plus className="mr-2 h-4 w-4" />
//           Add Employee
//         </Button>
//       </div>

//       <Tabs defaultValue="all" className="mb-8">
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
//           <TabsList>
//             <TabsTrigger value="all" className="flex items-center gap-2">
//               <Users className="h-4 w-4" />
//               All Employees
//             </TabsTrigger>
//             <TabsTrigger value="active" className="flex items-center gap-2">
//               <Badge
//                 variant="outline"
//                 className="h-5 w-5 rounded-full bg-green-500"
//               />
//               Active
//             </TabsTrigger>
//             <TabsTrigger value="inactive" className="flex items-center gap-2">
//               <Badge
//                 variant="outline"
//                 className="h-5 w-5 rounded-full bg-gray-300"
//               />
//               Inactive
//             </TabsTrigger>
//           </TabsList>
//           <div className="flex items-center gap-2 w-full sm:w-auto">
//             <div className="relative flex-1 sm:flex-none">
//               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input
//                 type="search"
//                 placeholder="Search employees..."
//                 className="pl-8 w-full sm:w-[250px]"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   className="cursor-pointer"
//                 >
//                   <Filter className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-[200px]">
//                 <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <div className="p-2">
//                   <p className="text-xs font-medium mb-1">Department</p>
//                   <Select
//                     value={selectedDepartment}
//                     onValueChange={setSelectedDepartment}
//                   >
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="Select department" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Departments</SelectItem>
//                       {departments.map((dept) => (
//                         <SelectItem key={dept.id} value={dept.id}>
//                           {dept.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="p-2">
//                   <p className="text-xs font-medium mb-1">Role</p>
//                   <Select value={selectedRole} onValueChange={setSelectedRole}>
//                     <SelectTrigger className="w-full">
//                       <SelectValue placeholder="Select role" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Roles</SelectItem>
//                       {roles.map((role) => (
//                         <SelectItem key={role.id} value={role.id}>
//                           {role.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </DropdownMenuContent>
//             </DropdownMenu>
//             <Button variant="outline" size="icon" className="cursor-pointer">
//               <Download className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         <TabsContent value="all" className="m-0">
//           <Card>
//             <CardContent className="p-0">
//               <div className="rounded-md border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-[50px]">
//                         <Checkbox
//                           checked={
//                             selectedEmployees.length ===
//                               filteredEmployees.length &&
//                             filteredEmployees.length > 0
//                           }
//                           onCheckedChange={handleSelectAll}
//                           aria-label="Select all employees"
//                         />
//                       </TableHead>
//                       <TableHead className="w-[250px]">
//                         <div className="flex items-center space-x-2">
//                           <span>Employee</span>
//                           <ArrowUpDown className="h-3 w-3" />
//                         </div>
//                       </TableHead>
//                       <TableHead>Department</TableHead>
//                       <TableHead>Role</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Permissions</TableHead>
//                       <TableHead className="text-right">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredEmployees.length === 0 ? (
//                       <TableRow>
//                         <TableCell
//                           colSpan={7}
//                           className="text-center py-8 text-muted-foreground"
//                         >
//                           No employees found matching your criteria
//                         </TableCell>
//                       </TableRow>
//                     ) : (
//                       filteredEmployees.map((emp) => (
//                         <TableRow key={emp.id}>
//                           <TableCell>
//                             <Checkbox
//                               checked={selectedEmployees.includes(emp.id)}
//                               onCheckedChange={(checked) =>
//                                 handleSelectEmployee(emp.id, !!checked)
//                               }
//                               aria-label={`Select ${getFullName(emp)}`}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-3">
//                               <Avatar>
//                                 <AvatarImage
//                                   src={emp.image_url || "/placeholder.svg"}
//                                   alt={getFullName(emp)}
//                                 />
//                                 <AvatarFallback>
//                                   {getFullName(emp)
//                                     .split(" ")
//                                     .map((n) => n[0])
//                                     .join("")}
//                                 </AvatarFallback>
//                               </Avatar>
//                               <div>
//                                 <p className="font-medium">
//                                   {getFullName(emp)}
//                                 </p>
//                                 <p className="text-sm text-muted-foreground">
//                                   {emp.email}
//                                 </p>
//                               </div>
//                             </div>
//                           </TableCell>
//                           <TableCell>{emp.department.name}</TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <Badge
//                                 variant={
//                                   emp.role.name === "admin"
//                                     ? "default"
//                                     : "outline"
//                                 }
//                               >
//                                 {emp.role.name}
//                               </Badge>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <Badge
//                                 variant="outline"
//                                 className={`h-2 w-2 rounded-full ${emp.employment.working_status === "active" ? "bg-green-500" : emp.employment.working_status === "inactive" ? "bg-gray-300" : "bg-red-200"}`}
//                               />
//                               {emp.employment.working_status}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-1">
//                               {emp.role.permissions.map(
//                                 (permission: PermissionType, index: number) => (
//                                   <Badge
//                                     key={index}
//                                     variant="secondary"
//                                     className="text-xs"
//                                   >
//                                     {permission.name}
//                                   </Badge>
//                                 )
//                               )}
//                               {emp.role.permissions.length === 0 && (
//                                 <span className="text-sm text-muted-foreground">
//                                   None
//                                 </span>
//                               )}
//                             </div>
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {" "}
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button variant="ghost" size="icon">
//                                   <MoreHorizontal className="h-4 w-4" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                                 <DropdownMenuSeparator />
//                                 <DropdownMenuItem
//                                   onClick={() => handleEditEmployee(emp)}
//                                 >
//                                   <UserCog className="mr-2 h-4 w-4" />
//                                   Edit Details
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem
//                                   onClick={() => handleManageRole(emp)}
//                                 >
//                                   <Users className="mr-2 h-4 w-4" />
//                                   Manage Role
//                                 </DropdownMenuItem>
//                                 <DropdownMenuSeparator />
//                                 <DropdownMenuItem className="text-destructive">
//                                   <Trash2 className="mr-2 h-4 w-4" />
//                                   Delete
//                                 </DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </TableCell>
//                         </TableRow>
//                       ))
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//         <TabsContent value="active" className="m-0">
//           {/* Similar table structure for active employees */}
//           <Card>
//             <CardContent className="p-4 text-center text-muted-foreground">
//               Showing only active employees
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="inactive" className="m-0">
//           {/* Similar table structure for inactive employees */}
//           <Card>
//             <CardContent className="p-4 text-center text-muted-foreground">
//               Showing only inactive employees
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">
//               Total Employees
//             </CardTitle>
//             <Users className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{mockEmployees.length}</div>
//             <p className="text-xs text-muted-foreground">
//               +2 in the last month
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">
//               Active Employees
//             </CardTitle>
//             <Badge
//               variant="outline"
//               className="h-4 w-4 rounded-full bg-green-500"
//             />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {
//                 mockEmployees.filter(
//                   (emp) => emp.employment.working_status === "active"
//                 ).length
//               }
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {Math.round(
//                 (mockEmployees.filter(
//                   (emp) => emp.employment.working_status === "active"
//                 ).length /
//                   mockEmployees.length) *
//                   100
//               )}
//               % of total
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Departments</CardTitle>
//             <Filter className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{departments.length}</div>
//             <p className="text-xs text-muted-foreground">
//               Across the organization
//             </p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
//             <Shield className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {mockEmployees.filter((emp) => emp.role.name === "admin").length}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               With administrative access
//             </p>
//           </CardContent>
//         </Card>
//       </div>
//       {/* Employee Dialog */}
//       {currentEmployee && (
//         <EmployeeDetailDialog
//           open={isEmployeeDialogOpen}
//           onOpenChange={setIsEmployeeDialogOpen}
//           employee={currentEmployee}
//         />
//       )}

//       {/* Role Dialog */}
//       {currentEmployee && (
//         <RoleDialog
//           open={isRoleDialogOpen}
//           onOpenChange={setIsRoleDialogOpen}
//           employee={currentEmployee}
//         />
//       )}
//     </div>
//   );
// }
