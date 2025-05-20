"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDateLong, formatDateShort } from "@/utils/dateFormatter";
import { getInitials } from "@/utils/getInitials";
import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  User,
  Users,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "@/components/task-list";
import { PerformanceChart } from "@/components/performance-chart";
import { TargetList } from "@/components/target-list";
import { EmploymentHistoryCard } from "@/components/employment-hitsory-card";
import { EduCertCard } from "@/components/edu-cert-card";
import { SalaryHistoryCard } from "@/components/salary-history-card";
import { TaskType } from "@/types/types";
import { getMockSessionUser } from "@/lib/getMockData";
import React from "react";
import { useSearchParams } from "next/navigation";

interface userProps {
  searchParams: {
    id?: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ProfilePage({ searchParams }: userProps) {
  const params = useSearchParams();
  const id = params.get("id");

  const current_user = getMockSessionUser();
  let user;

  if (id === current_user.id) {
    user = current_user;
  } else {
    user = null; // Xử lý lỗi nếu không tìm thấy user
  }

  if (!user) {
    return <div>User not found</div>; // Hoặc redirect
  }

  // Tính số năm kinh nghiệm
  const hireDate = new Date(user?.hire_date ?? "");
  const today = new Date();

  // Số năm kinh nghiệm
  const yearsOfExperience = today.getFullYear() - hireDate.getFullYear();

  // Định dạng lại ngày sinh
  const formattedBirthDate = formatDateLong(user?.birth_date ?? "");

  // Định dạng lại ngày được thuê
  const formattedHiredDate = formatDateShort(user?.hire_date ?? "");

  // Định dạng lại ngày bắt đầu làm việc
  const formattedStartDate = formatDateLong(user?.employment.start_date ?? "");

  // Danh sách các nhiệm vụ
  const activeTasks = (user?.tasks ?? []).filter(
    (task: TaskType) =>
      task.status === "in_progress" || task.status === "pending"
  );

  // Danh sách các nhiệm vụ đã hoàn thành
  const completedTasks = (user?.tasks ?? []).filter(
    (task: TaskType) => task.status === "completed"
  );

  // Tỷ lệ hoàn thành nhiệm vụ
  const completionRate =
    (user?.tasks ?? []).length > 0
      ? Math.round((completedTasks.length / (user?.tasks ?? []).length) * 100)
      : 0;

  return (
    <div className="container mx-auto max-w-5xl">
      {/* Profile header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary/10">
              <AvatarImage
                src={
                  `${user?.image_url}` || "/placeholder.svg?height=80&width=80"
                }
                alt={`${user?.first_name} ${user?.last_name}`}
              />
              <AvatarFallback className="text-lg">
                {getInitials(user?.first_name ?? "", user?.last_name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">
                {user?.first_name ?? ""} {user?.last_name ?? ""}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>{user?.position.name ?? ""}</span>
                <span className="">•</span>
                <Building className="h-4 w-4" />
                <span>{user?.department.name ?? ""}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-primary/10">
                  {user?.team?.name ?? ""}
                </Badge>
                <Badge
                  variant={
                    user?.employment.working_status === "active"
                      ? "default"
                      : "destructive"
                  }
                >
                  {user?.employment?.working_status
                    ? user.employment.working_status.charAt(0).toUpperCase() +
                      user.employment.working_status.slice(1)
                    : ""}
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
            <Button size="sm" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left side */}
        <div className="space-y-6">
          {/* Personal Information Card */}
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
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user?.phone_number || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{user?.address || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Born: {formattedBirthDate}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>Nationality: {user?.nationality || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  Gender:{" "}
                  {user?.gender
                    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                    : "Not provided"}
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

          {/* Employment Details Card */}
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
                  <span>{user?.department.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Position:</span>
                  <span>{user?.position.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Team:</span>
                  <span>{user?.team?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant={
                      user?.employment.working_status === "active"
                        ? "default"
                        : "destructive"
                    }
                    className="text-xs"
                  >
                    {user?.employment.working_status
                      ? user.employment.working_status.charAt(0).toUpperCase() +
                        user.employment.working_status.slice(1)
                      : ""}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Start Date:</span>
                  <span>{formattedStartDate}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Task Completion</h4>
                <div className="flex items-center justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="text-muted-foreground">
                    {completionRate}%
                  </span>
                </div>
                <Progress value={completionRate} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{completedTasks.length} completed</span>
                  <span>{user?.tasks?.length} total</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right side (Main content area) */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="">
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

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    Professional Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Experienced {user?.position.name} with {yearsOfExperience}{" "}
                  years at the company. Currently working in the{" "}
                  {user?.department.name} department as part of the{" "}
                  {user?.team?.name} team. Specializes in project management,
                  team leadership, and strategic planning.
                </CardContent>
              </Card>
              {/* Quick Stat */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Performance Rating
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 fill-primary text-primary dark:text-white dark:fill-white" />
                      <Star className="h-5 w-5 fill-primary text-primary dark:text-white dark:fill-white" />
                      <Star className="h-5 w-5 fill-primary text-primary dark:text-white dark:fill-white" />
                      <Star className="h-5 w-5 fill-primary text-primary dark:text-white dark:fill-white" />
                      <Star className="h-5 w-5 text-muted-foreground" />
                      <span className="ml-2 text-2xl font-bold">4.2</span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        /5
                      </span>
                    </div>
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
                      <CheckCircle className="h-5 w-5 text-primary dark:text-white" />
                      <span className="ml-2 text-2xl font-bold">
                        {completedTasks.length}
                      </span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        /{user?.tasks?.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Peer Recognition
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 text-red-500" />
                      <span className="ml-2 text-2xl font-bold">24</span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        votes
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-2xl">
                    Current Tasks
                  </CardTitle>
                  <CardDescription>
                    Tasks currently assigned or in progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskList tasks={activeTasks.slice(0, 3)} />
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full cursor-pointer"
                  >
                    View All Tasks
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    Performance Reviews
                  </CardTitle>
                  <CardDescription>
                    Historical performance evaluations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <PerformanceChart
                      performanceData={user?.performance_review ?? []}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    Peer Recognition
                  </CardTitle>
                  <CardDescription>
                    Votes received from colleagues
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4"></div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full cursor-pointer"
                  >
                    View All Feedback
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Tasks Tab*/}
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
                  <TaskList tasks={activeTasks} />
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
                  <TaskList tasks={completedTasks.slice(0, 5)} />
                </CardContent>
                {completedTasks.length > 0 && (
                  <CardFooter>
                    {" "}
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    Personal Targets
                  </CardTitle>
                  <CardDescription>
                    Long-term goals and objectives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TargetList targets={user?.targets?.slice(0, 3) ?? []} />
                </CardContent>
                {(user?.targets?.length ?? 0) > 0 && (
                  <CardFooter>
                    {" "}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full cursor-pointer"
                    >
                      View All Targets
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

            {/* History Tab */}
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
                  <EmploymentHistoryCard
                    employmentHistory={user?.employment_history ?? []}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    Education & Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>{EduCertCard()}</CardContent>
              </Card>
            </TabsContent>

            {/* Salary Tab */}
            <TabsContent value="salary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <CreditCard className="mr-2 h-5 w-5 dark:text-primary-foreground text-primary" />
                    Current Compensation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Current Salary:
                      </span>
                      <span className="text-xl font-bold">
                        ${user?.employment.salary.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Effective Since:</span>
                      <span>
                        {new Date(
                          user?.employment.start_date ?? ""
                        ).toLocaleDateString()}
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
                  <CardDescription>
                    Historical salary progression
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SalaryHistoryCard
                    salaryHistory={user?.salary_history ?? []}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
