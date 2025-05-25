import { TaskType } from "@/types/types";
import { AlertCircle, CheckCircle2, CircleEllipsis, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TaskListProps {
  tasks: TaskType[];
}

export function TaskList({ tasks }: TaskListProps) {
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  // Hàm lấy icon của tasks
  const getStatusIcon = (status: string) => {
    switch (status) {
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

  //Hàm lấy variant của tasks
  const getStatusVariant = (status: string) => {
    switch (status) {
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
                {task.status.replace("_", " ").charAt(0).toUpperCase() +
                  task.status.replace("_", " ").slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {task.description}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span>
                Deadline: {new Date(task.deadline).toLocaleDateString()}
              </span>
            </div>
            {index < sortedTasks.length - 1 && <Separator className="my-4" />}
          </div>
        ))
      )}
    </div>
  );
}
