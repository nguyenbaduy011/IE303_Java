import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  FileText,
  ChevronRight,
  ListTodo,
  Target,
} from "lucide-react";

import type { TaskType } from "@/app/api/get-user-task/route";

export function TaskListCard({ tasks }: { tasks: TaskType[] }) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return {
          variant: "default" as const,
          icon: <CheckCircle className="h-3 w-3" />,
          color: "text-green-600",
          bgColor: "bg-green-50 border-green-200",
          label: "Hoàn thành",
        };
      case "in_progress":
        return {
          variant: "secondary" as const,
          icon: <Clock className="h-3 w-3" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50 border-blue-200",
          label: "Đang thực hiện",
        };
      case "pending":
        return {
          variant: "outline" as const,
          icon: <AlertCircle className="h-3 w-3" />,
          color: "text-orange-600",
          bgColor: "bg-orange-50 border-orange-200",
          label: "Chờ xử lý",
        };
      default:
        return {
          variant: "outline" as const,
          icon: <Clock className="h-3 w-3" />,
          color: "text-muted-foreground",
          bgColor: "bg-muted border-border",
          label: status,
        };
    }
  };

  const getPriorityFromDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { label: "Quá hạn", color: "text-red-600", urgent: true };
    if (diffDays <= 1)
      return { label: "Hôm nay", color: "text-red-600", urgent: true };
    if (diffDays <= 3)
      return {
        label: `${diffDays} ngày`,
        color: "text-orange-600",
        urgent: true,
      };
    if (diffDays <= 7)
      return {
        label: `${diffDays} ngày`,
        color: "text-yellow-600",
        urgent: false,
      };
    return {
      label: `${diffDays} ngày`,
      color: "text-green-600",
      urgent: false,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Group tasks by status
  const groupedTasks = tasks.reduce(
    (acc, task) => {
      const status = task.status.toLowerCase();
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    },
    {} as Record<string, TaskType[]>
  );

  const statusOrder = ["pending", "in_progress", "completed"];
  const completedTasks = tasks.filter(
    (task) => task.status.toLowerCase() === "completed"
  );
  const totalTasks = tasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return (
    <Card className="w-full max-w-2xl shadow-lg border border-border bg-card pt-0 isolate">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
              <ListTodo className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-primary-foreground">
                Danh Sách Nhiệm Vụ
              </CardTitle>
              <p className="text-xs text-primary-100">
                Tổng cộng: {totalTasks} nhiệm vụ
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-foreground">
              {completionRate}%
            </div>
            <div className="text-xs text-primary-100">Hoàn thành</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ListTodo className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Không có nhiệm vụ nào
            </h3>
            <p className="text-sm text-muted-foreground">
              Hiện tại chưa có nhiệm vụ nào được giao.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Tiến độ hoàn thành</span>
                <span className="text-primary font-bold">
                  {completionRate}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{completedTasks.length} hoàn thành</span>
                <span>{totalTasks - completedTasks.length} còn lại</span>
              </div>
            </div>

            <Separator />

            {/* Task List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {statusOrder.map((status) => {
                const statusTasks = groupedTasks[status];
                if (!statusTasks || statusTasks.length === 0) return null;

                const statusConfig = getStatusConfig(status);

                return (
                  <div key={status} className="space-y-3">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
                      {statusConfig.icon}
                      {statusConfig.label} ({statusTasks.length})
                    </h3>
                    <div className="space-y-3">
                      {statusTasks.map((task, index) => {
                        const priority = getPriorityFromDeadline(task.deadline);
                        return (
                          <div
                            key={task.id || index}
                            className={`p-4 rounded-lg border transition-all hover:shadow-sm ${statusConfig.bgColor}`}
                          >
                            <div className="space-y-3">
                              {/* Task Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-foreground truncate flex items-center gap-2">
                                    <Target className="h-4 w-4 text-primary flex-shrink-0" />
                                    {task.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                </div>
                                <Badge
                                  variant={statusConfig.variant}
                                  className="flex items-center gap-1 ml-2"
                                >
                                  {statusConfig.icon}
                                  {statusConfig.label}
                                </Badge>
                              </div>

                              {/* Task Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    Hạn:
                                  </span>
                                  <span
                                    className={`font-medium ${priority.color}`}
                                  >
                                    {formatDate(task.deadline)} (
                                    {priority.label})
                                  </span>
                                  {priority.urgent && (
                                    <AlertCircle className="h-3 w-3 text-red-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    Người thực hiện:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {getInitials(
                                          task.assigned_to.first_name,
                                          task.assigned_to.last_name
                                        )}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">
                                      {task.assigned_to.first_name}{" "}
                                      {task.assigned_to.last_name}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full hover:bg-primary/5 hover:border-primary/40"
              >
                <FileText className="mr-2 h-4 w-4" />
                Xem tất cả nhiệm vụ
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
