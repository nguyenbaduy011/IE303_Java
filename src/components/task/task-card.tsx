/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { Calendar, AlertCircle, Flag } from "lucide-react";
import { TaskType } from "@/api/get-user-task/route";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TaskCardProps {
  task: TaskType;
  currentUserId: string;
  onUpdateStatus: (taskId: string, status: TaskType["status"]) => void;
  onRequestReview: (taskId: string) => void;
  getUserAvatar: () => string;
  getStatusBadge: (status: TaskType["status"]) => any;
  formatDate: (date: string) => string;
  getDaysUntilDeadline: (deadline: string) => number;
}

export function TaskCard({
  task,
  currentUserId,
  onUpdateStatus,
  getUserAvatar,
  getStatusBadge,
  formatDate,
  getDaysUntilDeadline,
}: TaskCardProps) {
  const statusBadge = getStatusBadge(task.status);
  const daysUntilDeadline = getDaysUntilDeadline(task.deadline);
  const isOverdue = daysUntilDeadline < 0;
  const isAssignedToCurrentUser = task.assignedTo.id === currentUserId;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge
            variant={statusBadge.variant}
            className={statusBadge.className}
          >
            {statusBadge.icon}
            {statusBadge.label}
          </Badge>
          <div
            className={`flex items-center text-sm ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}
          >
            <Calendar className="mr-1 h-4 w-4" />
            {isOverdue
              ? `${Math.abs(daysUntilDeadline)} days overdue`
              : `${daysUntilDeadline} days left`}
          </div>
        </div>
        <CardTitle className="text-lg">{task.name}</CardTitle>
        {task.description && (
          <CardDescription className="line-clamp-2">
            {task.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={getUserAvatar() || "/placeholder.svg"}
                  alt={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                />
                <AvatarFallback>
                  {`${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Assigned to you
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Deadline: {formatDate(task.deadline)}
          </div>
          {isAssignedToCurrentUser &&
            task.status !== "completed" &&
            task.status !== "failed" &&
            task.status !== "pending" && (
              <div className="flex gap-2">
                {/* {task.status === "pending" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onUpdateStatus(task.id, "in_progress")}
                  >
                    Resume Task
                  </Button>
                )} */}
                {task.status === "in_progress" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1 cursor-pointer">
                        <Flag className="h-4 w-4 mr-1" />
                        Request Review
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will send a request
                          to the reviewer to evaluate the task and change its
                          status accordingly.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onUpdateStatus(task.id, "pending")}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          {task.status === "pending" && (
            <div className="rounded-md bg-orange-500/10 p-2 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-orange-700">
                  Waiting for review
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
