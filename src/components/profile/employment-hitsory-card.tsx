import { Briefcase, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export type EmploymentHistoryCardType = {
  id: string; // UUID, khóa chính
  start_date: string; // Ngày bắt đầu, không null
  end_date: string; // Ngày kết thúc, không null
  salary: number; // Lương, không null, phải >= 0
  description?: string | null; // Mô tả, có thể null
  department: {
    name: string; // Tên phòng ban
  };
  position: {
    name: string; // Tên vị trí
  };
  team: {
    name: string | null; // Tên đội nhóm, có thể null
  };
};

interface EmploymentHistoryCardProps {
  employmentHistory: EmploymentHistoryCardType[];
}
export function EmploymentHistoryCard({
  employmentHistory,
}: EmploymentHistoryCardProps) {
  const sortedHistory = [...employmentHistory].sort(
    (a, b) =>
      new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedHistory.map((history, index) => (
        <div key={history.id} className="relative">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <span className="text-base font-medium">
                Position: {history.position.name}
              </span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span>
                  {history.start_date
                    ? new Date(history.start_date).toLocaleDateString()
                    : "N/A"}{" "}
                  -{" "}
                  {history.end_date
                    ? new Date(history.end_date).toLocaleDateString()
                    : "current"}
                </span>
              </div>
              <p className="text-sm">{history.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Department: {history.department.name}</span>
                <span>•</span>
                <span>Team: {history.team.name || "None"}</span>
                <span>•</span>
                <span>Salary: ${history.salary.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {index < sortedHistory.length - 1 && (
            <div className="absolute left-5 top-10 h-full w-[1px] -translate-x-1/2 bg-border" />
          )}
          {index < sortedHistory.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  );
}
