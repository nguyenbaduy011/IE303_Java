import { AlertCircle, CheckCircle2, CircleEllipsis, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TaskType } from "@/app/api/get-user-task/route";

interface TaskListProps {
  tasks: TaskType[];
}

export function TaskList({ tasks }: TaskListProps) {
  console.log("TaskList - Received tasks:", tasks); // Debug tasks

  const sortedTasks = [...tasks]
    .filter(
      (task) => task.deadline && !isNaN(new Date(task.deadline).getTime())
    )
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <CircleEllipsis className="h-4 w-4 text-blue-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      case "failed":
        return "destructive";
      case "pending":
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {sortedTasks.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No tasks found
        </p>
      ) : (
        sortedTasks.map((task, index) => (
          <div key={task.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                <span className="font-medium">{task.name}</span>
              </div>
              <Badge variant={getStatusVariant(task.status)}>
                {task.status
                  ?.replace("_", " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase()) || "Pending"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {task.description || "No description provided"}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span>
                Deadline:{" "}
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            {index < sortedTasks.length - 1 && <Separator className="my-4" />}
          </div>
        ))
      )}
    </div>
  );
}
