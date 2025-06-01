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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { PerformanceChart } from "@/components/profile/performance-chart";
import { SalaryHistoryCard } from "@/components/profile/salary-history-card";
import { formatDateLong, formatDateShort } from "@/utils/dateFormatter";
import { getInitials } from "@/utils/getInitials";
import { useAuth } from "@/contexts/auth-context";
import { fetchTasks, TaskType } from "@/api/get-user-task/route";
import {
  EmploymentHistoryType,
  EmploymentHistoryResponse,
  fetchEmploymentHistory,
} from "@/api/employment-history/route";
import {
  SalaryHistoryType,
  SalaryHistoryResponse,
  fetchSalaryHistory,
} from "@/api/salary-history/route";
import { UserType, fetchUserById } from "@/api/get-user-information/route";
import {
  EmploymentDetailType,
  EmploymentDetailResponse,
  fetchEmploymentDetail,
} from "@/api/employment-detail/route";
import { EmploymentHistoryCard } from "@/components/profile/employment-hitsory-card";

export type UserProfileCardPropsType = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  hire_date: string;
  birth_date: string;
  gender: string;
  nationality: string;
  image_url: string;
  phone_number: string;
  address: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  department?: {
    id: string;
    name: string;
  };
  position?: {
    id: string;
    name: string;
  };
  team?: {
    id: string;
    name: string;
  };
  working_status: string;
  salary: number;
};

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
  const [currentSalary, setCurrentSalary] = useState<number>(0);
  const [effectiveDate, setEffectiveDate] = useState<string>("");

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
          image_url: authUser.image_url ?? "",
          gender: authUser.gender as "male" | "female",
          nationality: authUser.nationality,
          phone_number: authUser.phone_number,
          hire_date: authUser.hire_date,
          address: authUser.address,
          working_status: authUser.working_status as
            | "active"
            | "inactive"
            | "terminated",
          role: {
            ...authUser.role,
            permissions: Array.isArray(authUser.role.permissions)
              ? authUser.role.permissions.map((p: any) =>
                  typeof p === "string" ? p : p.name ?? p.id
                )
              : [],
          },
          salary: authUser.salary,
        }
      : null,
    loading: !isSessionUser,
    error: null,
  });
  const [employmentInfo, setEmploymentInfo] = useState<
    DataState<UserProfileCardPropsType>
  >({
    data: null,
    loading: true,
    error: null,
  });
  const [employmentDetail, setEmploymentDetail] = useState<
    DataState<EmploymentDetailType>
  >({
    data: null,
    loading: true,
    error: null,
  });
  const [tasks, setTasks] = useState<DataState<TaskType[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [employmentHistory, setEmploymentHistory] = useState<
    DataState<EmploymentHistoryType[]>
  >({
    data: [],
    loading: true,
    error: null,
  });
  const [salaryHistory, setSalaryHistory] = useState<
    DataState<SalaryHistoryType[]>
  >({
    data: [],
    loading: !(authUser?.role?.name === "SUPER_ADMIN" || isSessionUser),
    error: null,
  });

  const handleSalaryChange = useCallback(
    (salary: number, effectiveDate: string) => {
      console.log("ProfilePage - Salary Change:", { salary, effectiveDate });
      setCurrentSalary(salary);
      setEffectiveDate(effectiveDate);
    },
    []
  );

  const handleSessionError = useCallback(() => {
    setUser(null);
    router.push("/login");
  }, [router, setUser]);

  const mapToPersonalInfo = (user: UserType): UserProfileCardPropsType => ({
    id: user.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    hire_date: user.hireDate,
    birth_date: user.birthDate,
    gender: user.gender,
    nationality: user.nationality,
    image_url: "",
    phone_number: user.phoneNumber,
    address: user.address,
    role: {
      id: "not-assigned",
      name: "Not Assigned",
      permissions: [],
    },
    working_status: "active",
    salary: 0,
  });

  const mapToEmploymentInfo = (
    detail: EmploymentDetailType
  ): UserProfileCardPropsType => ({
    id: detail.user.id,
    email: "",
    first_name: detail.user.first_name,
    last_name: detail.user.last_name,
    hire_date: detail.start_date,
    birth_date: "",
    gender: "",
    nationality: "",
    image_url: "",
    phone_number: "",
    address: "",
    role: {
      id: "not-assigned",
      name: "Not Assigned",
      permissions: [],
    },
    department: {
      id: detail.department.id,
      name: detail.department.name,
    },
    position: {
      id: detail.position.id,
      name: detail.position.name,
    },
    team: {
      id: detail.team.id,
      name: detail.team.name,
    },
    working_status: detail.working_status,
    salary: 0,
  });

  const handleApiError = (
    err: any,
    setState: React.Dispatch<React.SetStateAction<DataState<any>>>,
    errorMessage: string
  ) => {
    setState({
      data: null,
      loading: false,
      error: err.message || errorMessage,
    });
    if (err.message?.includes("Session expired")) {
      handleSessionError();
    }
  };

  const fetchData = async <T,>(
    setState: React.Dispatch<React.SetStateAction<DataState<T>>>,
    mapToUserProfile: (user: UserType) => T
  ) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await fetchUserById(id);
      if (!user) {
        throw new Error("User information not found.");
      }
      setState({ data: mapToUserProfile(user), loading: false, error: null });
    } catch (err: any) {
      handleApiError(err, setState, "Unable to load data.");
    }
  };

  useEffect(() => {
    if (!authUser) {
      handleSessionError();
      return;
    }

    const loadAllData = async () => {
      const fetchPromises: Promise<void>[] = [];

      if (!isSessionUser) {
        fetchPromises.push(
          fetchData<UserProfileCardPropsType>(
            setPersonalInfo,
            mapToPersonalInfo
          )
        );
      }

      fetchPromises.push(
        (async () => {
          try {
            setEmploymentDetail((prev) => ({
              ...prev,
              loading: true,
              error: null,
            }));
            const data: EmploymentDetailResponse = await fetchEmploymentDetail(
              id
            );
            if (data.employment_detail) {
              setEmploymentDetail({
                data: data.employment_detail,
                loading: false,
                error: null,
              });
              setEmploymentInfo({
                data: mapToEmploymentInfo(data.employment_detail),
                loading: false,
                error: null,
              });
            } else {
              throw new Error("Employment detail not found.");
            }
          } catch (err: any) {
            handleApiError(
              err,
              setEmploymentDetail,
              "Unable to load employment detail."
            );
            handleApiError(
              err,
              setEmploymentInfo,
              "Unable to load employment info."
            );
          }
        })(),
        (async () => {
          try {
            setTasks((prev) => ({ ...prev, loading: true, error: null }));
            const data = await fetchTasks(id);
            setTasks({ data: data.tasks, loading: false, error: null });
          } catch (err: any) {
            handleApiError(err, setTasks, "Unable to load task data.");
          }
        })(),
        (async () => {
          try {
            setEmploymentHistory((prev) => ({
              ...prev,
              loading: true,
              error: null,
            }));
            const data: EmploymentHistoryResponse =
              await fetchEmploymentHistory(id);
            setEmploymentHistory({
              data: data.history,
              loading: false,
              error: null,
            });
          } catch (err: any) {
            handleApiError(
              err,
              setEmploymentHistory,
              "Unable to load employment history."
            );
          }
        })(),
        (async () => {
          try {
            setSalaryHistory((prev) => ({
              ...prev,
              loading: !!(
                authUser.role?.name === "SUPER_ADMIN" || isSessionUser
              ),
              error: null,
            }));
            if (authUser.role?.name === "SUPER_ADMIN" || isSessionUser) {
              const data: SalaryHistoryResponse = await fetchSalaryHistory(id);
              setSalaryHistory({
                data: data.salary_history,
                loading: false,
                error: null,
              });
            } else {
              setSalaryHistory({
                data: [],
                loading: false,
                error: null,
              });
            }
          } catch (err: any) {
            handleApiError(
              err,
              setSalaryHistory,
              "Unable to load salary history."
            );
          }
        })()
      );

      await Promise.all(fetchPromises);
    };

    loadAllData();
  }, [id, authUser, isSessionUser, handleSessionError]);

  if (!authUser) {
    return null;
  }

  if (
    personalInfo.error ||
    employmentInfo.error ||
    employmentDetail.error ||
    tasks.error ||
    employmentHistory.error ||
    salaryHistory.error
  ) {
    return (
      <div className="container mx-auto max-w-5xl flex h-40 flex-col items-center justify-center text-center">
        <p className="text-destructive">
          {personalInfo.error ||
            employmentInfo.error ||
            employmentDetail.error ||
            tasks.error ||
            employmentHistory.error ||
            salaryHistory.error}
        </p>
        <Button variant="link" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  if (
    personalInfo.loading ||
    employmentInfo.loading ||
    employmentDetail.loading ||
    tasks.loading ||
    employmentHistory.loading ||
    salaryHistory.loading
  ) {
    return (
      <div className="container mx-auto max-w-5xl flex h-40 flex-col items-center justify-center text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!personalInfo.data || !employmentInfo.data || !employmentDetail.data) {
    return (
      <div className="container mx-auto max-w-5xl flex h-40 flex-col items-center justify-center text-center">
        <p className="text-destructive">
          Unable to load profile data. Please try again later.
        </p>
        <Button variant="link" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const user = personalInfo.data;
  const { working_status, department, position, team } = employmentInfo.data;

  const hireDate = new Date(user.hire_date);
  const today = new Date();
  const yearsOfExperience = today.getFullYear() - hireDate.getFullYear();

  const formattedBirthDate = formatDateLong(user.birth_date);
  const formattedHiredDate = formatDateShort(user.hire_date);

  const activeTasks: TaskType[] =
    tasks.data?.filter(
      (task) => task.status === "in_progress" || task.status === "pending"
    ) || [];
  const completedTasks: TaskType[] =
    tasks.data?.filter((task) => task.status === "completed") || [];
  const completionRate =
    tasks.data && tasks.data.length > 0
      ? Math.round((completedTasks.length / tasks.data.length) * 100)
      : 0;

  return (
    <div className="bg-muted/20">
      <div className="container mx-auto max-w-7xl py-6">
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
                  <span>{position?.name || "Not Assigned"}</span>
                  <span className="">•</span>
                  <Building className="h-4 w-4" />
                  <span>{department?.name || "Not Assigned"}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {team?.name && (
                    <Badge variant="outline" className="bg-primary/10">
                      {team.name}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      working_status === "active" ? "default" : "destructive"
                    }
                  >
                    {working_status.charAt(0).toUpperCase() +
                      working_status.slice(1)}
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
                  <Link href={`/profile/${user.id}/edit`}>
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
                  <span>{user.phone_number || "Not Provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.address || "Not Provided"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Date of Birth: {formattedBirthDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span>Nationality: {user.nationality}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Gender:{" "}
                    {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>Hire Date: {formattedHiredDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {yearsOfExperience}{" "}
                    {yearsOfExperience === 1 ? "year" : "years"} at the company
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Briefcase className="mr-2 h-5 w-5 text-primary" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Department:</span>
                    <span>{department?.name || "Not Assigned"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Position:</span>
                    <span>{position?.name || "Not Assigned"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Team:</span>
                    <span>{team?.name || "Not Assigned"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Status:</span>
                    <Badge
                      variant={
                        working_status === "active" ? "default" : "destructive"
                      }
                      className="text-xs"
                    >
                      {working_status.charAt(0).toUpperCase() +
                        working_status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Start Date:</span>
                    <span>
                      {employmentDetail.data?.start_date
                        ? formatDateShort(employmentDetail.data.start_date)
                        : "Not Available"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Position Description:</span>
                    <span>
                      {employmentDetail.data?.position.description ||
                        "No description provided"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Task Completion</h4>
                  {tasks.data && tasks.data.length > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Completed {completedTasks.length} / {tasks.data.length}{" "}
                      tasks ({completionRate}%).
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No tasks available.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="">
              <TabsList
                className={`grid w-full ${
                  !(authUser.role?.name === "SUPER_ADMIN" || authUser.id === id)
                    ? "grid-cols-4"
                    : "grid-cols-5"
                }`}
              >
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
                {(authUser.role?.name === "SUPER_ADMIN" ||
                  authUser.id === id) && (
                  <TabsTrigger value="salary" className="cursor-pointer">
                    Salary
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      Professional Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {position?.name || "Not Assigned"} with {yearsOfExperience}{" "}
                    years of experience at the company. Currently working in the{" "}
                    {department?.name || "Not Assigned"} department
                    {team?.name ? ` in the ${team.name} team` : ""}.{" "}
                    {employmentDetail.data?.position.description ||
                      "Specializing in project management, team leadership, and strategic planning."}
                  </CardContent>
                </Card>
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
                        Completed Tasks
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
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ) : tasks.error ? (
                        <p className="text-sm text-destructive">
                          {tasks.error}
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
                      Ongoing Tasks
                    </CardTitle>
                    <CardDescription>
                      Tasks in progress or pending
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tasks.loading ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ) : tasks.error ? (
                      <p className="text-sm text-destructive">{tasks.error}</p>
                    ) : activeTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No ongoing tasks available.
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
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ) : tasks.error ? (
                      <p className="text-sm text-destructive">{tasks.error}</p>
                    ) : completedTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No completed tasks available.
                      </p>
                    ) : (
                      <TaskList tasks={completedTasks.slice(0, 5)} />
                    )}
                  </CardContent>
                  {completedTasks.length > 5 && (
                    <CardFooter>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full cursor-pointer"
                      >
                        View all completed tasks
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
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ) : employmentHistory.error ? (
                      <p className="text-sm text-destructive">
                        {employmentHistory.error}
                      </p>
                    ) : employmentHistory.data?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No employment history available.
                      </p>
                    ) : (
                      <EmploymentHistoryCard
                        employmentHistory={employmentHistory.data ?? []}
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
                      Current Salary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Current Salary:
                        </span>
                        <span className="text-xl font-bold">
                          {currentSalary > 0
                            ? `$${currentSalary.toLocaleString()}`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Effective From:</span>
                        <span>
                          {effectiveDate
                            ? new Date(effectiveDate).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      Salary History
                    </CardTitle>
                    <CardDescription>History of salary changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {salaryHistory.loading ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ) : salaryHistory.error ? (
                      <p className="text-sm text-destructive">
                        {salaryHistory.error}
                      </p>
                    ) : salaryHistory.data?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No salary history available.
                      </p>
                    ) : (
                      <SalaryHistoryCard
                        salaryHistory={salaryHistory.data ?? []}
                        onChange={handleSalaryChange}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
