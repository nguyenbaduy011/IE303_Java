import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, User, XCircle } from "lucide-react";
import { TaskType } from "@/api/get-user-task/route";
import { cn } from "@/lib/utils";

interface TaskViewDialogProps {
  task: TaskType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskViewDialog({
  task,
  open,
  onOpenChange,
}: TaskViewDialogProps) {
  if (!task) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: TaskType["status"]) => {
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
          className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
          icon: <AlertCircle className="h-3 w-3 mr-1" />,
          label: "Pending Review",
        };
      default:
        return {
          variant: "secondary" as const,
          className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: "Unknown",
        };
    }
  };

  const statusBadge = getStatusBadge(task.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Description
            </h4>
            <p className="text-sm text-foreground">
              {task.description || "No description provided"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Deadline
            </h4>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-foreground">
                {formatDate(task.deadline)}
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Status
            </h4>
            <Badge
              variant={statusBadge.variant}
              className={cn("gap-1", statusBadge.className)}
            >
              {statusBadge.icon}
              {statusBadge.label}
            </Badge>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">
              Assigned To
            </h4>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-foreground">
                {task.assigned_to.first_name} {task.assigned_to.last_name}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
