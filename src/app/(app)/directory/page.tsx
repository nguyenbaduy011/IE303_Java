"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Building, MapPin } from "lucide-react";
import {
  EmployeeType,
  fetchEmployees,
} from "@/app/api/get-all-user(user)/route";
import { getFullName } from "@/utils/getFullName";

interface DisplayEmployee {
  id: string;
  name: string;
  position: string;
  department: string;
  location: string; // Giả định, có thể điều chỉnh
  avatar?: string;
}

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<DisplayEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách phòng ban từ dữ liệu nhân viên
  const departments = Array.from(
    new Set(employees.map((e) => e.department))
  ).sort();

  // Giả định danh sách location (có thể thay đổi dựa trên yêu cầu)
  const locations = ["Hà Nội", "TP.HCM", "Đà Nẵng"]; // Thay bằng dữ liệu thực nếu có

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const data: EmployeeType[] = await fetchEmployees();
        // Ánh xạ dữ liệu từ API sang định dạng hiển thị
        const mappedEmployees: DisplayEmployee[] = data.map((employee) => ({
          id: employee.user.id,
          name: getFullName(employee.user?.first_name, employee.user.last_name),
          position: employee.position?.name ?? "No information",
          department: employee.department?.name ?? "No information",
          location: "Hà Nội", // Giả định, thay bằng dữ liệu thực nếu có
          avatar: undefined, // API không có avatar, để undefined
        }));
        setEmployees(mappedEmployees);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load employees"
        );
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading employees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Employee Directory
          </h1>
          <p className="text-muted-foreground">
            Browse and search for employees across the organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="w-full pl-8 bg-background"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="all">All Employees</TabsTrigger>
          <TabsTrigger value="department">By Department</TabsTrigger>
          <TabsTrigger value="location">By Location</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employees.map((employee) => (
              <Link href={`/profile/${employee.id}`} key={employee.id}>
                <Card className="overflow-hidden hover:border-[#024023]/50 transition-colors">
                  <CardContent className="p-0">
                    <div className="h-24 bg-gradient-to-r from-[#024023]/20 to-[#024023]/10" />
                    <div className="p-4 pt-0 -mt-12">
                      <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage
                          src={employee.avatar || "/placeholder.svg"}
                          alt={employee.name}
                        />
                        <AvatarFallback>
                          {employee.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="mt-2">
                        <h3 className="font-semibold text-lg">
                          {employee.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {employee.position}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <Building className="h-3.5 w-3.5" />
                          <span>{employee.department}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{employee.location}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="department" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <Card
                key={dept}
                className="overflow-hidden hover:border-[#024023]/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#024023]/10 p-3 rounded-full">
                      <Building className="h-6 w-6 text-[#024023]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{dept}</h3>
                      <p className="text-muted-foreground">
                        {employees.filter((e) => e.department === dept).length}{" "}
                        employees
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="location" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <Card
                key={location}
                className="overflow-hidden hover:border-[#024023]/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#024023]/10 p-3 rounded-full">
                      <MapPin className="h-6 w-6 text-[#024023]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{location}</h3>
                      <p className="text-muted-foreground">
                        {
                          employees.filter((e) => e.location === location)
                            .length
                        }{" "}
                        employees
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
