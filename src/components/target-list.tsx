import { TargetType } from "@/types/types";
import { Target } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface TargetListProps {
  targets: TargetType[];
}

export function TargetList({ targets }: TargetListProps) {
  const sortedTargets = [...targets].sort(
    (a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
  );

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
      {sortedTargets.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No targets found
        </p>
      ) : (
        sortedTargets.map((target, index) => (
          <div key={target.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">{target.name}</span>
              </div>
              <Badge variant={getStatusVariant(target.status)}>
                {target.status.replace("_", " ").charAt(0).toUpperCase() +
                  target.status.replace("_", " ").slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {target.description}
            </p>
            <div className="flex items-center justify-between text-xs">
              <span>
                Deadline: {new Date(target.deadline).toLocaleDateString()}
              </span>
            </div>
            {index < sortedTargets.length - 1 && <Separator className="my-4" />}
          </div>
        ))
      )}
    </div>
  );
}
