/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Calendar,
  CheckCircle,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { fetchTasks, TaskType } from "@/app/api/get-user-task/route";
import { getTeam, Member } from "@/app/api/get-team-member/route";
import {
  fetchEmploymentDetail,
  EmploymentDetailResponse,
} from "@/app/api/employment-detail/route";
import { checkOnline, CheckOnlineResponse } from "@/app/api/check-online/route";
import { getOnlineUsers } from "@/app/api/online-users/route";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ExtendedMember extends Member {
  isOnline: boolean;
}

function getStatusBadge(status: TaskType["status"]) {
  switch (status) {
    case "completed":
      return {
        variant: "default" as const,
        className:
          "bg-primary text-primary-foreground hover:brightness-110 shadow-xs",
        icon: <CheckCircle className="h-3 w-3 mr-1 text-primary-foreground" />,
        label: "Completed",
      };
    case "in_progress":
      return {
        variant: "secondary" as const,
        className:
          "bg-blue-600/20 text-blue-600 border-blue-600/30 hover:bg-blue-600/30 shadow-xs",
        icon: <Clock className="h-3 w-3 mr-1 text-blue-600" />,
        label: "In Progress",
      };
    case "failed":
      return {
        variant: "destructive" as const,
        className:
          "bg-destructive text-destructive-foreground hover:brightness-110 shadow-xs",
        icon: <XCircle className="h-3 w-3 mr-1 text-destructive-foreground" />,
        label: "Failed",
      };
    case "pending":
      return {
        variant: "secondary" as const,
        className:
          "bg-yellow-600/20 text-yellow-600 border-yellow-600/30 hover:bg-yellow-600/30 shadow-xs",
        icon: <AlertCircle className="h-3 w-3 mr-1 text-yellow-600" />,
        label: "Pending",
      };
    default:
      return {
        variant: "secondary" as const,
        className:
          "bg-muted text-muted-foreground border-muted/30 hover:bg-muted/50 shadow-xs",
        icon: <Clock className="h-3 w-3 mr-1 text-muted-foreground" />,
        label: "Pending",
      };
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<ExtendedMember[]>([]);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) {
      setError("User not authenticated. Please log in.");
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch tasks
        const tasksData = await fetchTasks(user.id);
        setTasks(tasksData.tasks);

        // Gọi getOnlineUsers
        const onlineUsers = await getOnlineUsers();
        setActiveUsers(onlineUsers.length);

        // Fetch team information
        const employmentResponse: EmploymentDetailResponse =
          await fetchEmploymentDetail(user.id);
        if (
          !employmentResponse.employment_detail ||
          !employmentResponse.employment_detail.team
        ) {
          throw new Error("No team information found for your account.");
        }

        const teamId = employmentResponse.employment_detail.team.id;
        const teamData = await getTeam(teamId);
        if (!teamData?.members) {
          throw new Error("No members found in this team.");
        }

        // Fetch online status for each member
        const membersWithOnlineStatus = await Promise.all(
          teamData.members.map(async (member) => {
            const onlineStatus = await checkOnline({ id: member.user.id });
            return {
              ...member,
              isOnline: onlineStatus.isValid,
            };
          })
        );
        setTeamMembers(membersWithOnlineStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Internal error");
      }
    };

    fetchData();
  }, [user?.id, router]);

  // Generate calendar days for the current month
  useEffect(() => {
    const days: Date[] = [];
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const firstDayOfWeek = firstDay.getDay();

    for (let i = firstDayOfWeek; i > 0; i--) {
      const prevMonthDay = new Date(firstDay);
      prevMonthDay.setDate(prevMonthDay.getDate() - i);
      days.push(prevMonthDay);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = new Date(lastDay);
      nextMonthDay.setDate(nextMonthDay.getDate() + i);
      days.push(nextMonthDay);
    }

    setCalendarDays(days);
  }, [currentDate]);

  const performanceRate =
    tasks.length > 0
      ? (tasks.filter((task) => task.status === "completed").length /
          tasks.length) *
        100
      : 0;

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getEventsForDay = (day: Date) => {
    return tasks.filter(
      (task) =>
        new Date(task.deadline).getDate() === day.getDate() &&
        new Date(task.deadline).getMonth() === day.getMonth() &&
        new Date(task.deadline).getFullYear() === day.getFullYear()
    );
  };

  const handlePreviousMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 bg-muted/20">
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-7xl space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">
                  Welcome back, {user?.first_name}
                </h1>
                <p className="text-muted-foreground">
                  {user
                    ? typeof user.position === "string"
                      ? user.position
                      : user.position?.name || "Employee"
                    : "Employee"}{" "}
                  •{" "}
                  {user
                    ? typeof user.department === "string"
                      ? user.department
                      : user.department?.name || "Department"
                    : "Department"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link href="/calendar">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Today:</span>{" "}
                  {new Date().toLocaleDateString()}
                </Link>
              </Button>
            </div>

            {/* Quick Stats and Content */}
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Left Column - Stats and Tasks */}
              <div className="lg:col-span-3 col-span-full space-y-6">
                {/* Quick Stats */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        My Tasks
                      </CardTitle>
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{tasks.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {tasks.filter((t) => t.status === "completed").length}{" "}
                        completed
                      </p>
                      <Progress className="mt-2 h-1" value={performanceRate} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Performance Rating
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {performanceRate ? performanceRate.toFixed(2) : "N/A"}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Latest review
                      </p>
                      <Progress className="mt-2 h-1" value={performanceRate} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Employees
                      </CardTitle>
                      <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{activeUsers}</div>
                      <p className="text-xs text-muted-foreground">
                        Active users
                      </p>
                      <Progress
                        className="mt-2 h-1"
                        value={activeUsers * 100}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* My Tasks */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-primary">
                      My Tasks
                    </CardTitle>
                    <CardDescription>
                      Your assigned tasks and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {tasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">
                          No tasks assigned yet.
                        </p>
                        <Button
                          variant="link"
                          className="mt-2 text-primary"
                          asChild
                        >
                          <Link href="/tasks">Explore tasks</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tasks.slice(0, 5).map((task, index) => {
                          const { variant, className, icon, label } =
                            getStatusBadge(task.status);
                          return (
                            <Link
                              key={task.id}
                              href={`/tasks/${task.id}`}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-md bg-card/50 border border-transparent hover:bg-card/80 hover:border-border/50 transition-all duration-200 animate-slide-up",
                                index < tasks.slice(0, 5).length - 1 &&
                                  "border-b border-border/50"
                              )}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="space-y-0.5">
                                  <p className="text-sm font-semibold text-primary">
                                    {task.name}
                                  </p>
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {task.description}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    Due:{" "}
                                    {new Date(
                                      task.deadline
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant={variant}
                                className={cn(
                                  "text-xs font-semibold px-2.5 py-0.5 flex items-center gap-1 rounded-sm animate-pulse",
                                  className
                                )}
                              >
                                {icon}
                                {label}
                              </Badge>
                            </Link>
                          );
                        })}
                        {tasks.length > 5 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="link"
                              className="text-primary text-xs"
                              asChild
                            >
                              <Link href="/tasks">View all tasks</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Mini Calendar and Team Members */}
              <div className="lg:col-span-2 col-span-full space-y-4">
                {/* Mini Calendar */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-primary">
                        Upcoming Tasks
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePreviousMonth}
                          className="h-6 w-6 cursor-pointer"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePreviousMonth}
                          className="h-6 w-6 cursor-pointer"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      {monthNames[currentDate.getMonth()]}{" "}
                      {currentDate.getFullYear()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 text-xs">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day, index) => (
                          <div
                            key={index}
                            className="p-1 text-center font-medium text-muted-foreground"
                          >
                            {day}
                          </div>
                        )
                      )}
                      {calendarDays.map((day, index) => {
                        const dayEvents = getEventsForDay(day);
                        return (
                          <div
                            key={index}
                            className={cn(
                              "min-h-[60px] p-1 border-b border-r last:border-r-0 text-xs",
                              isCurrentMonth(day)
                                ? "bg-background"
                                : "bg-muted/30",
                              isToday(day) && "bg-primary-50/50"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={cn(
                                  "inline-flex h-5 w-5 items-center justify-center rounded-full",
                                  isToday(day) &&
                                    "bg-primary text-primary-foreground font-medium"
                                )}
                              >
                                {day.getDate()}
                              </span>
                              {dayEvents.length > 0 && (
                                <Badge className="h-4 px-1 text-[10px] border-border">
                                  {dayEvents.length}
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 mt-1">
                              {dayEvents
                                .slice(0, 2)
                                .map((event, eventIndex) => (
                                  <TooltipProvider key={eventIndex}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="w-full rounded-md border px-1 py-0.5 text-left text-[10px] truncate bg-primary-400/10 text-primary-400 border-primary-400/30 cursor-pointer hover:bg-primary-400/20">
                                          {event.name}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-card text-card-foreground border-border p-3 rounded-md shadow-lg max-w-[250px] animate-fade-in">
                                        <p className="font-medium text-primary text-sm">
                                          {event.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Due:{" "}
                                          {new Date(
                                            event.deadline
                                          ).toLocaleDateString()}
                                        </p>
                                        {event.description && (
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {event.description}
                                          </p>
                                        )}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))}
                              {dayEvents.length > 2 && (
                                <div className="w-full text-[10px] text-muted-foreground text-left pl-1">
                                  + {dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Team Members */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-primary">
                      Team Members
                    </CardTitle>
                    <CardDescription>
                      Your team members and their online status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                          <p className="text-sm text-muted-foreground">
                            No team members found.
                          </p>
                        </div>
                      ) : (
                        teamMembers.map((member) => (
                          <div
                            key={member.user.id}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src="/placeholder.svg"
                                  alt={`${member.user.first_name} ${member.user.last_name}`}
                                />
                                <AvatarFallback>
                                  {member.user.first_name.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-primary">
                                  {member.user.first_name}{" "}
                                  {member.user.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {member.employment_detail.position.name}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                member.isOnline ? "default" : "secondary"
                              }
                              className={cn(
                                "text-xs",
                                member.isOnline
                                  ? "bg-green-500 text-white"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {member.isOnline ? "Online" : "Offline"}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
