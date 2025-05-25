/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  Users,
} from "lucide-react";
import { TaskList } from "@/components/profile/task-list";

import { formatDateLong, formatDateShort } from "@/utils/dateFormatter";
import { getInitials } from "@/utils/getInitials";
import { useAuth } from "@/contexts/auth-context";
import {
  EmploymentHistoryCardType,
  PerformanceChartCardType,
  SalaryHistoryCardPropsType,
} from "@/types/types-for-APIs";
import { PerformanceChart } from "@/components/profile/performance-chart";
import { EmploymentHistoryCard } from "@/components/profile/employment-hitsory-card";
import { SalaryHistoryCard } from "@/components/profile/salary-history-card";

export type UserProfileCardPropsType = {
  id: string; // UUID, khóa chính
  first_name: string; // Tên
  last_name: string; // Họ
  email: string; // Email
  birth_date: string; // Ngày sinh
  image_url?: string | null; // URL hình ảnh
  gender: "male" | "female"; // Giới tính
  nationality?: string | null; // Quốc tịch
  phone_number?: string | null; // Số điện thoại
  hire_date: string; // Ngày tuyển dụng
  address?: string | null; // Địa chỉ
  working_status: "active" | "inactive" | "terminated";
};

// Định nghĩa interface cho trạng thái dữ liệu
interface DataState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export default function ProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user: authUser, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const isSessionUser = authUser && authUser.id === id;

  // States cho từng loại dữ liệu
  const [personalInfo, setPersonalInfo] = useState<
    DataState<UserProfileCardPropsType>
  >({
    data: isSessionUser
      ? {
          id: authUser.id,
          first_name: authUser.first_name,
          last_name: authUser.last_name,
          email: authUser.email,
          birth_date: authUser.birth_date,
          image_url: authUser.image_url,
          gender: authUser.gender as "male" | "female",
          nationality: authUser.nationality,
          phone_number: authUser.phone_number,
          hire_date: authUser.hire_date,
          address: authUser.address,
          working_status: authUser.working_status as
            | "active"
            | "inactive"
            | "terminated",
        }
      : null,
    loading: !isSessionUser,
    error: null,
  });
  const [employmentInfo, setEmploymentInfo] = useState<
    DataState<EmploymentHistoryCardType>
  >({
    data: isSessionUser
      ? {
          id: authUser.id,
          salary: 0,
          start_date: authUser?.hire_date || new Date().toISOString(),
          end_date: "Not provided",
          department: { name: authUser?.department?.name || "Not provided" },
          position: { name: authUser?.position?.name || "Not provided" },
          team: authUser?.team ? { name: authUser.team.name } : undefined,
        }
      : null,
    loading: !isSessionUser,
    error: null,
  });
  const [tasks, setTasks] = useState<DataState<PerformanceChartCardType[]>>({
    data: null,
    loading: false,
    error: null,
  });
  const [employmentHistory, setEmploymentHistory] = useState<
    DataState<EmploymentHistoryCardType[]>
  >({
    data: null,
    loading: false,
    error: null,
  });
  const [salaryHistory, setSalaryHistory] = useState<
    DataState<SalaryHistoryCardPropsType[]>
  >({
    data: null,
    loading: false,
    error: null,
  });

  // Xử lý lỗi session hết hạn
  const handleSessionError = useCallback(() => {
    sessionStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }, [router, setUser]);

  // Hàm gọi API chung
  const fetchData = async <T,>(
    endpoint: string,
    setState: React.Dispatch<React.SetStateAction<DataState<T>>>
  ) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleSessionError();
          throw new Error("Session expired. Please log in again.");
        }
        if (response.status === 404) {
          throw new Error(
            "API not available. This feature is under development."
          );
        }
        throw new Error(`Failed to fetch data from ${endpoint}`);
      }

      const data = await response.json();
      setState({ data, loading: false, error: null });
    } catch (err: any) {
      setState({
        data: null,
        loading: false,
        error: err.message || "Failed to load data.",
      });
    }
  };

  // Tải dữ liệu ban đầu
  useEffect(() => {
    if (!authUser) {
      handleSessionError();
      return;
    }

    if (!isSessionUser) {
      fetchData<UserProfileCardPropsType>(
        `/api/users/${id}/personal`,
        setPersonalInfo
      );
      fetchData<EmploymentHistoryCardType>(
        `/api/users/${id}/employment`,
        setEmploymentInfo
      );
    }
  }, [id, authUser, isSessionUser, handleSessionError]);

  // Tải dữ liệu theo tab
  useEffect(() => {
    if (!authUser) return;

    if (
      activeTab === "tasks" &&
      !isSessionUser &&
      !tasks.data &&
      !tasks.loading
    ) {
      fetchData<PerformanceChartCardType[]>(`/api/users/${id}/tasks`, setTasks);
    }
    if (
      activeTab === "history" &&
      !isSessionUser &&
      !employmentHistory.data &&
      !employmentHistory.loading
    ) {
      fetchData<EmploymentHistoryCardType[]>(
        `/api/users/${id}/employment-history`,
        setEmploymentHistory
      );
    }
    if (
      activeTab === "salary" &&
      !isSessionUser &&
      !salaryHistory.data &&
      !salaryHistory.loading
    ) {
      fetchData<SalaryHistoryCardPropsType[]>(
        `/api/users/${id}/salary-history`,
        setSalaryHistory
      );
    }
  }, [activeTab, authUser, id, isSessionUser, handleSessionError]);

  if (!authUser) {
    return null;
  }

  if (personalInfo.error || employmentInfo.error) {
    return (
      <div className="container mx-auto max-w-5xl flex h-40 flex-col items-center justify-center text-center">
        <p className="text-destructive">
          {personalInfo.error || employmentInfo.error}
        </p>
        <Button variant="link" asChild>
          <Link href="/profiles">Back to profiles</Link>
        </Button>
      </div>
    );
  }

  if (personalInfo.loading || employmentInfo.loading) {
    return null; // Skeleton được xử lý bởi loading.tsx
  }

  if (!personalInfo.data || !employmentInfo.data) {
    return (
      <div className="container mx-auto max-w-5xl flex h-40 flex-col items-center justify-center text-center">
        <p className="text-destructive">
          Unable to load profile data. Please try again later.
        </p>
        <Button variant="link" asChild>
          <Link href="/profiles">Back to profiles</Link>
        </Button>
      </div>
    );
  }

  const user = personalInfo.data;
  const { department, position, team, salary, start_date, end_date } =
    employmentInfo.data;

  const hireDate = new Date(user.hire_date);
  const today = new Date();
  const yearsOfExperience = today.getFullYear() - hireDate.getFullYear();

  const formattedBirthDate = formatDateLong(user.birth_date);
  const formattedHiredDate = formatDateShort(user.hire_date);
  const formattedStartDate = formatDateLong(start_date);

  const activeTasks: PerformanceChartCardType[] = isSessionUser
    ? []
    : tasks.data?.filter(
        (task) => task.status === "in_progress" || task.status === "pending"
      ) || [];
  const completedTasks: PerformanceChartCardType[] = isSessionUser
    ? []
    : tasks.data?.filter((task) => task.status === "completed") || [];
  const completionRate = isSessionUser
    ? 0
    : tasks.data && tasks.data.length > 0
      ? Math.round((completedTasks.length / tasks.data.length) * 100)
      : 0;

  return (
    <div className="container mx-auto max-w-5xl py-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/10">
              <AvatarImage
                src={user.image_url || "/placeholder.svg?height=80&width=80"}
                alt={`${user.first_name} ${user.last_name}`}
              />
              <AvatarFallback className="text-lg">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                {user.first_name} {user.last_name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>{position.name}</span>
                <span className="">•</span>
                <Building className="h-4 w-4" />
                <span>{department.name}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {team && (
                  <Badge variant="outline" className="bg-primary/10">
                    {team.name}
                  </Badge>
                )}
                <Badge
                  variant={
                    user.working_status === "active" ? "default" : "destructive"
                  }
                >
                  {user.working_status.charAt(0).toUpperCase() +
                    user.working_status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2 md:mt-0">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              Message
            </Button>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Button>
            {isSessionUser && (
              <Button size="sm" className="cursor-pointer" asChild>
                <Link href={`/profiles/${user.id}/edit`}>
                  <User className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <User className="mr-2 h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone_number || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{user.address || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Born: {formattedBirthDate}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Nationality: {user.nationality || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  Gender:{" "}
                  {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>Hired: {formattedHiredDate}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {yearsOfExperience}{" "}
                  {yearsOfExperience === 1 ? "year" : "years"} at company
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <User className="mr-2 h-5 w-5 text-primary" />
                Employment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Department:</span>
                  <span>{department.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Position:</span>
                  <span>{position.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Team:</span>
                  <span>{team?.name || "Not assigned"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant={
                      user.working_status === "active" ? "default" : "destructive"
                    }
                    className="text-xs"
                  >
                    {user.working_status.charAt(0).toUpperCase() +
                      user.working_status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Start Date:</span>
                  <span>{formattedStartDate}</span>
                </div>
              </div>
              {isSessionUser && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Task Completion</h4>
                  <p className="text-sm text-muted-foreground">
                    Task data is not available yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="cursor-pointer">
                Overview
              </TabsTrigger>
              <TabsTrigger value="performance" className="cursor-pointer">
                Performance
              </TabsTrigger>
              <TabsTrigger value="tasks" className="cursor-pointer">
                Tasks
              </TabsTrigger>
              <TabsTrigger value="history" className="cursor-pointer">
                History
              </TabsTrigger>
              <TabsTrigger value="salary" className="cursor-pointer">
                Salary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    Professional Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Experienced {position.name} with {yearsOfExperience} years at
                  the company. Currently working in the {department.name}{" "}
                  department
                  {team ? ` as part of the ${team.name} team` : ""}. Specializes
                  in project management, team leadership, and strategic
                  planning.
                </CardContent>
              </Card>
              {isSessionUser ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Additional Information
                    </CardTitle>
                    <CardDescription>
                      More features are under development
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Performance ratings and task completion data will be
                      available soon.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">
                        Task Completion Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tasks.data && tasks.data.length > 0 ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="ml-2 text-2xl font-bold">
                            {completionRate}%
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No tasks available.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Tasks Completed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <span className="ml-2 text-2xl font-bold">
                          {completedTasks.length}
                        </span>
                        <span className="ml-1 text-sm text-muted-foreground">
                          /{tasks.data?.length || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    Task Completion Performance
                  </CardTitle>
                  <CardDescription>
                    Task completion rate over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {tasks.loading ? (
                      <p className="text-sm text-muted-foreground">
                        Loading performance data...
                      </p>
                    ) : tasks.error ? (
                      <p className="text-sm text-muted-foreground">
                        {tasks.error}
                      </p>
                    ) : isSessionUser ? (
                      <p className="text-sm text-muted-foreground">
                        Task performance data is not available yet.
                      </p>
                    ) : tasks.data?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No tasks available to display performance.
                      </p>
                    ) : (
                      <PerformanceChart tasks={tasks.data || []} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    Active Tasks
                  </CardTitle>
                  <CardDescription>
                    Tasks currently in progress or pending
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tasks.loading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading tasks...
                    </p>
                  ) : tasks.error ? (
                    <p className="text-sm text-muted-foreground">
                      {tasks.error}
                    </p>
                  ) : isSessionUser ? (
                    <p className="text-sm text-muted-foreground">
                      Task data is not available yet.
                    </p>
                  ) : (
                    <TaskList tasks={activeTasks} />
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    Completed Tasks
                  </CardTitle>
                  <CardDescription>Recently completed tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  {tasks.loading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading tasks...
                    </p>
                  ) : tasks.error ? (
                    <p className="text-sm text-muted-foreground">
                      {tasks.error}
                    </p>
                  ) : isSessionUser ? (
                    <p className="text-sm text-muted-foreground">
                      Task data is not available yet.
                    </p>
                  ) : (
                    <TaskList tasks={completedTasks.slice(0, 5)} />
                  )}
                </CardContent>
                {completedTasks.length > 0 && (
                  <CardFooter>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full cursor-pointer"
                    >
                      View All Completed Tasks
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    Employment History
                  </CardTitle>
                  <CardDescription>
                    Previous positions within the company
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {employmentHistory.loading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading history...
                    </p>
                  ) : employmentHistory.error ? (
                    <p className="text-sm text-muted-foreground">
                      {employmentHistory.error}
                    </p>
                  ) : isSessionUser ? (
                    <p className="text-sm text-muted-foreground">
                      Employment history is not available yet.
                    </p>
                  ) : (
                    <EmploymentHistoryCard
                      employmentHistory={employmentHistory.data || []}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="salary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <CreditCard className="mr-2 h-5 w-5 dark:text-primary-foreground text-primary" />
                    Current Compensation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSessionUser ? (
                    <p className="text-sm text-muted-foreground">
                      Salary data is not available yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Current Salary:
                        </span>
                        <span className="text-xl font-bold">
                          ${salary.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    Salary History
                  </CardTitle>
                  <CardDescription>
                    Historical salary progression
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {salaryHistory.loading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading salary history...
                    </p>
                  ) : salaryHistory.error ? (
                    <p className="text-sm text-muted-foreground">
                      {salaryHistory.error}
                    </p>
                  ) : isSessionUser ? (
                    <p className="text-sm text-muted-foreground">
                      Salary history is not available yet.
                    </p>
                  ) : (
                    <SalaryHistoryCard
                      salaryHistory={salaryHistory.data || []}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
