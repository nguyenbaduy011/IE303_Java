/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Calendar, CheckCircle, TrendingUp, Users } from "lucide-react";
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
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { fetchTasks, TaskType } from "@/api/get-user-task/route";
import Link from "next/link";
import { getOnlineUsers } from "@/api/online-users/route";

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) {
      setError("User not authenticated. Please log in.");
      return;
    }

    const fetchData = async () => {
      try {
        // Gọi fetchTasks
        const tasksData = await fetchTasks(user.id);
        setTasks(tasksData.tasks);
        console.log("task" + tasksData);

        // Gọi getOnlineUsers
        const onlineUsers = await getOnlineUsers();
        setActiveUsers(onlineUsers.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Internal error");
      }
    };

    fetchData();
  }, [user?.id]);

  const performanceRate =
    tasks.length > 0
      ? tasks.filter((task) => task.status === "completed").length /
        tasks.length
      : 0; // Tránh chia cho 0

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

            {/* Hiển thị lỗi nếu có */}
            {error && <div className="text-red-500 p-4">Error: {error}</div>}

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <Progress
                    className="mt-2 h-1"
                    value={performanceRate * 100}
                  />
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
                    {performanceRate
                      ? (performanceRate * 100).toFixed(2)
                      : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">Latest review</p>
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
                  <p className="text-xs text-muted-foreground">Active users</p>
                  <Progress className="mt-2 h-1" value={activeUsers * 100} />
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 md:grid-cols-7">
              {/* Left Column - 4/7 width */}
              <div className="md:col-span-4 space-y-6">
                {/* My Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle>My Tasks</CardTitle>
                    <CardDescription>
                      Your assigned tasks and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{task.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Due:{" "}
                              {new Date(task.deadline).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant={
                              task.status === "completed"
                                ? "default"
                                : task.status === "in_progress"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {task.status.replace("_", " ")}
                          </Badge>
                        </div>
                      ))}
                      {tasks.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No tasks assigned yet.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - 3/7 width */}
              <div className="md:col-span-3 space-y-6">
                {/* Recent Notifications
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Notifications</CardTitle>
                    <CardDescription>
                      Latest updates and announcements
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentNotifications.map((notification) => (
                        <div key={notification.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                notification.is_urgent
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {notification.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                notification.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card> */}

                {/* Top Performers
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performers</CardTitle>
                    <CardDescription>Current period rankings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topPerformers.map((performer, index) => (
                        <div
                          key={performer.review.id}
                          className="flex items-center gap-4"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            {index + 1}
                          </div>
                          <Avatar>
                            <AvatarImage
                              src={
                                performer.user?.image_url || "/placeholder.svg"
                              }
                              alt={`${performer.user?.first_name} ${performer.user?.last_name}`}
                            />
                            <AvatarFallback>
                              {performer.user?.first_name?.[0]}
                              {performer.user?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {performer.user?.first_name}{" "}
                              {performer.user?.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Performance Review
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {performer.review.rating}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card> */}

                {/* Performance Summary */}
                {/* {myPerformanceReview && (
                  <Card>
                    <CardHeader>
                      <CardTitle>My Performance</CardTitle>
                      <CardDescription>
                        Latest performance review
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Overall Rating
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            <span className="font-bold">
                              {myPerformanceReview.rating}/10
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={(myPerformanceReview.rating / 10) * 100}
                          className="h-2"
                        />
                        {myPerformanceReview.comment && (
                          <div className="rounded-md bg-muted p-3">
                            <p className="text-sm">
                              {myPerformanceReview.comment}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )} */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
