import type { SalaryHistoryType } from "@/types/types";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SalaryHistoryCardProps {
  salaryHistory: SalaryHistoryType[];
}

export function SalaryHistoryCard({ salaryHistory }: SalaryHistoryCardProps) {
  const sortedHistory = [...salaryHistory].sort(
    (a, b) =>
      new Date(b.effective_date).getTime() -
      new Date(a.effective_date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedHistory.map((history, index) => {
        const percentChange =
          history.previous_salary != null
            ? ((history.new_salary - history.previous_salary) /
                history.previous_salary) *
              100
            : 0;

        const isIncrease =
          history.previous_salary != null &&
          history.new_salary > history.previous_salary;

        const isSame = history.new_salary === history.previous_salary;
        return (
          <div key={history.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  ${history.new_salary.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Effective:{" "}
                  {new Date(history.effective_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center">
                <div
                  className={`flex items-center ${isIncrease ? "text-green-500" : isSame ? "text-muted-foreground" : "text-red-500"}`}
                >
                  {isIncrease ? (
                    <ArrowUp className="mr-1 h-4 w-4" />
                  ) : isSame ? (
                    <Minus className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {percentChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-1 text-sm">{history.reason}</p>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span>
                Previous: $
                {history.previous_salary != null
                  ? history.previous_salary.toLocaleString()
                  : 0}
              </span>
              <span className="mx-2">→</span>
              <span>New: ${history.new_salary.toLocaleString()}</span>
            </div>
            {index < sortedHistory.length - 1 && <Separator className="my-4" />}
          </div>
        );
      })}
    </div>
  );
}
