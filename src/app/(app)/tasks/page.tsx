"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  CheckCircle,
  User,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { TaskCard } from "@/components/task/task-card";
import { TaskType, fetchTasks } from "@/api/get-user-task/route";
import { useAuth } from "@/contexts/auth-context";
import { updateTaskStatus } from "@/api/change-task-status/route";
import { toast } from "sonner";

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch tasks on component mount
  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id)
        .then(async (response) => {
          const updatedTasks = await Promise.all(
            response.tasks.map(async (task: TaskType) => {
              const deadlineDate = new Date(task.deadline);
              const now = new Date();
              if (
                deadlineDate < now &&
                task.status !== "completed" &&
                task.status !== "failed"
              ) {
                try {
                  const updatedTask = await updateTaskStatus(task.id, "failed");
                  return (
                    updatedTask || {
                      ...task,
                      status: "failed" as TaskType["status"],
                      updatedAt: now.toISOString(),
                    }
                  );
                } catch (error) {
                  console.error(
                    `Error updating task ${task.id} status:`,
                    error
                  );
                  toast.error(`Failed to update task ${task.id} status`);
                  return task; // Keep original task if update fails
                }
              }
              return task;
            })
          );
          setTasks(updatedTasks as TaskType[]);
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
          toast.error("Failed to fetch tasks");
        });
    }
  }, [user]);

  // Check deadlines periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          const deadlineDate = new Date(task.deadline);
          const now = new Date();
          if (
            deadlineDate < now &&
            task.status !== "completed" &&
            task.status !== "failed"
          ) {
            updateTaskStatus(task.id, "failed").catch((error) => {
              console.error(`Error updating task ${task.id} status:`, error);
              toast.error(`Failed to update task ${task.id} status`);
            });
            return { ...task, status: "failed", updatedAt: now.toISOString() };
          }
          return task;
        })
      );
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Get all tasks for the user
  const allTasks = tasks.filter((task) => task.assigned_to.id === user?.id);

  // Get ongoing tasks for the user
  const ongoingTasks = tasks.filter(
    (task) => task.status === "in_progress" && task.assigned_to.id === user?.id
  );

  // Get pending review tasks for the user
  const pendingReviewTasks = tasks.filter(
    (task) => task.status === "pending" && task.assigned_to.id === user?.id
  );

  // Get completed tasks
  const completedTasks = tasks.filter(
    (task) => task.status === "completed" && task.assigned_to.id === user?.id
  );

  // Get failed tasks
  const failedTasks = tasks.filter(
    (task) => task.status === "failed" && task.assigned_to.id === user?.id
  );

  // Filter tasks based on search
  const filterTasks = (taskList: TaskType[]) => {
    return taskList.filter((task) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.name.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
        );
      }
      return true;
    });
  };

  // Xử lý cập nhật trạng thái task
  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: TaskType["status"]
  ) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Restrict status transitions
    if (
      (task.status === "in_progress" && newStatus === "pending") ||
      (task.status === "pending" && newStatus === "in_progress")
    ) {
      try {
        const updatedTask = await updateTaskStatus(taskId, newStatus);
        if (updatedTask) {
          setTasks(
            tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    status: newStatus,
                    updatedAt: new Date().toISOString(),
                  }
                : t
            )
          );
          const statusMessages = {
            in_progress: "Task marked as in progress",
            pending: "Task marked as pending",
          };
          toast.success(
            statusMessages[newStatus as keyof typeof statusMessages] ||
              "Task status updated"
          );
        }
      } catch (error) {
        console.error(`Error updating task ${taskId} status:`, error);
        toast.error("Failed to update task status");
      }
    }
  };

  // Handle requesting review
  const handleRequestReview = async (taskId: string) => {
    try {
      const updatedTask = await updateTaskStatus(taskId, "pending");
      if (updatedTask) {
        setTasks(
          tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: "pending" as TaskType["status"],
                  updatedAt: new Date().toISOString(),
                }
              : task
          )
        );
        toast.success("Task submitted for review");
      }
    } catch (error) {
      console.error(`Error requesting review for task ${taskId}:`, error);
      toast.error("Failed to submit task for review");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get days until deadline
  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 bg-muted/20">
        <main className="flex-1 p-6">
          <div className="container mx-auto space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Tasks</h1>
                <p className="text-muted-foreground">
                  View and manage your assigned tasks. Submit completed work for
                  review.
                </p>
              </div>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="all" className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  My Tasks ({allTasks.length})
                </TabsTrigger>
                <TabsTrigger value="ongoing" className="gap-2 cursor-pointer">
                  <Clock className="h-4 w-4" />
                  On Going ({ongoingTasks.length})
                </TabsTrigger>
                <TabsTrigger
                  value="pending-review"
                  className="gap-2 cursor-pointer"
                >
                  <AlertCircle className="h-4 w-4" />
                  Pending Review ({pendingReviewTasks.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2 cursor-pointer">
                  <CheckCircle className="h-4 w-4" />
                  Completed ({completedTasks.length})
                </TabsTrigger>
                <TabsTrigger value="failed" className="gap-2 cursor-pointer">
                  <XCircle className="h-4 w-4" />
                  Failed ({failedTasks.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {user &&
                    filterTasks(allTasks).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        currentUserId={user.id}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onRequestReview={handleRequestReview}
                        getUserAvatar={() =>
                          user.image_url ||
                          "/placeholder.svg?height=32&width=32"
                        }
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                        getDaysUntilDeadline={getDaysUntilDeadline}
                      />
                    ))}
                </div>
                {filterTasks(allTasks).length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                      No tasks assigned
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You don&apos;t have any tasks assigned to you yet.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="ongoing" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {user &&
                    filterTasks(ongoingTasks).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        currentUserId={user.id}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onRequestReview={handleRequestReview}
                        getUserAvatar={() =>
                          user.image_url ||
                          "/placeholder.svg?height=32&width=32"
                        }
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                        getDaysUntilDeadline={getDaysUntilDeadline}
                      />
                    ))}
                </div>
                {filterTasks(ongoingTasks).length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                      No ongoing tasks
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You don&apos;t have any ongoing tasks.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="pending-review" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {user &&
                    filterTasks(pendingReviewTasks).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        currentUserId={user.id}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onRequestReview={handleRequestReview}
                        getUserAvatar={() =>
                          user.image_url ||
                          "/placeholder.svg?height=32&width=32"
                        }
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                        getDaysUntilDeadline={getDaysUntilDeadline}
                      />
                    ))}
                </div>
                {filterTasks(pendingReviewTasks).length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                      No tasks pending review
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You don&apos;t have any tasks pending review.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {user &&
                    filterTasks(completedTasks).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        currentUserId={user.id}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onRequestReview={handleRequestReview}
                        getUserAvatar={() =>
                          user.image_url ||
                          "/placeholder.svg?height=32&width=32"
                        }
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                        getDaysUntilDeadline={getDaysUntilDeadline}
                      />
                    ))}
                </div>
                {filterTasks(completedTasks).length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                      No completed tasks
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You haven&apos;t completed any tasks yet.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="failed" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {user &&
                    filterTasks(failedTasks).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        currentUserId={user.id}
                        onUpdateStatus={handleUpdateTaskStatus}
                        onRequestReview={handleRequestReview}
                        getUserAvatar={() =>
                          user.image_url ||
                          "/placeholder.svg?height=32&width=32"
                        }
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                        getDaysUntilDeadline={getDaysUntilDeadline}
                      />
                    ))}
                </div>
                {filterTasks(failedTasks).length === 0 && (
                  <div className="text-center py-8">
                    <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                      No failed tasks
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      You don&apos;t have any failed tasks.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );

  // Get status badge variant and icon
  function getStatusBadge(status: TaskType["status"]) {
    switch (status) {
      case "completed":
        return {
          variant: "default" as const,
          className: "bg-green-500/10 text-green-500 border-green-500/20",
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          label: "Completed",
        };
      case "in_progress":
        return {
          variant: "secondary" as const,
          className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: "In Progress",
        };
      case "failed":
        return {
          variant: "destructive" as const,
          className: "bg-red-500/10 text-red-500 border-red-500/20",
          icon: <XCircle className="h-3 w-3 mr-1" />,
          label: "Failed",
        };
      case "pending":
        return {
          variant: "secondary" as const,
          className: "bg-purple-500/10 text-orange-500 border-purple-500/20",
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          label: "Pending Review",
        };
      default:
        return {
          variant: "secondary" as const,
          className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: "Pending",
        };
    }
  }
}
