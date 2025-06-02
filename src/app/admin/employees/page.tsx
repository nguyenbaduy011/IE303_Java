"use client";

import { useState, useEffect } from "react";
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

import { EmployeeDetailDialog } from "@/components/admin/employees/employee-detail-dialog";
import { RoleDialog } from "@/components/admin/employees/role-dialog";
import {
  EmployeeType,
  fetchEmployees,
} from "@/app/api/get-all-user(admin)/route";
import { DepartmentType, PositionType } from "@/types/types";

// Utility function to get full name from user
const getFullName = (employee: EmployeeType) =>
  `${employee.user.first_name} ${employee.user.last_name}`;

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeType | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees on mount
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const data = await fetchEmployees();
        setEmployees(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch employees"
        );
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  // Derive unique departments and roles from employees
  const departments = Array.from(
    new Set(employees.map((emp) => JSON.stringify(emp.department))),
    (str) => JSON.parse(str) as DepartmentType
  );
  const roles = Array.from(
    new Set(employees.map((emp) => JSON.stringify(emp.position))),
    (str) => JSON.parse(str) as PositionType
  );

  // Filter employees based on search, department, and role
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      getFullName(employee).toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      employee.position.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.department.id === selectedDepartment;
    const matchesRole =
      selectedRole === "all" || employee.position.id === selectedRole;

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

  // Render table content for a specific tab
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
                      <TableCell>{emp.department.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            emp.position.name.toLowerCase() === "admin"
                              ? "default"
                              : "outline"
                          }
                        >
                          {emp.position.name}
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
                        {emp.team ? (
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
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEditEmployee(emp)}
                              className="cursor-pointer"
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleManageRole(emp)}
                              className="cursor-pointer"
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Manage Position
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive cursor-pointer">
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
          onClick={() => {
            setCurrentEmployee(null);
            setIsEmployeeDialogOpen(true);
          }}
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
                employees.filter((emp) => emp.role.name === "SUPER_ADMIN")
                  .length
              }
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
