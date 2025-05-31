"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SalaryHistoryType } from "@/api/salary-history/route";
import { useEffect } from "react";

interface SalaryHistoryCardProps {
  salaryHistory: SalaryHistoryType[];
  onChange: (currentSalary: number, effectiveDate: string) => void;
}

export function SalaryHistoryCard({ salaryHistory, onChange }: SalaryHistoryCardProps) {
  // Debug: Log the salaryHistory prop

  const sortedHistory = [...(salaryHistory || [])].sort(
    (a, b) =>
      new Date(b.effective_date).getTime() -
      new Date(a.effective_date).getTime()
  );

  useEffect(() => {
    if (sortedHistory.length > 0) {
      const latestSalary = sortedHistory[0]; // Mục mới nhất
      if (
        !isNaN(latestSalary.new_salary) &&
        latestSalary.new_salary >= 0 &&
        latestSalary.effective_date
      ) {
        onChange(latestSalary.new_salary, latestSalary.effective_date);
      }
    }
  }, [sortedHistory, onChange]);

  // Handle empty salary history
  if (!salaryHistory || salaryHistory.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No salary history available.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {sortedHistory.map((history, index) => {
        // Calculate percentage change safely
        let percentChange: number = 0;
        if (
          !isNaN(history.percentage_change) &&
          history.percentage_change !== 0
        ) {
          percentChange = history.percentage_change;
        } else if (
          !isNaN(history.new_salary) &&
          !isNaN(history.previous_salary) &&
          history.previous_salary !== 0
        ) {
          percentChange =
            ((history.new_salary - history.previous_salary) /
              history.previous_salary) *
            100;
        }

        // Determine if salary increased, decreased, or remained the same
        const isIncrease =
          !isNaN(history.new_salary) &&
          !isNaN(history.previous_salary) &&
          history.new_salary > history.previous_salary;
        const isSame =
          !isNaN(history.new_salary) &&
          !isNaN(history.previous_salary) &&
          history.new_salary === history.previous_salary;

        // Debug: Log each history entry
        console.log(`SalaryHistoryCard - Entry ${history.id}:`, {
          new_salary: history.new_salary,
          previous_salary: history.previous_salary,
          percentage_change: history.percentage_change,
          calculated_percentChange: percentChange,
          effective_date: history.effective_date,
          reason: history.reason,
        });

        return (
          <div key={history.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {!isNaN(history.new_salary) && history.new_salary >= 0
                    ? `$${history.new_salary.toLocaleString()}`
                    : "N/A"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Effective:{" "}
                  {history.effective_date
                    ? new Date(history.effective_date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                <div
                  className={`flex items-center ${
                    isIncrease
                      ? "text-green-500"
                      : isSame
                        ? "text-muted-foreground"
                        : "text-red-500"
                  }`}
                >
                  {isIncrease ? (
                    <ArrowUp className="mr-1 h-4 w-4" />
                  ) : isSame ? (
                    <Minus className="mr-1 h-4 w-4" />
                  ) : (
                    <ArrowDown className="mr-1 h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {!isNaN(percentChange) ? percentChange.toFixed(1) : "0.0"}%
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-1 text-sm">
              {history.reason || "No reason provided"}
            </p>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <span>
                Previous: $
                {!isNaN(history.previous_salary) && history.previous_salary >= 0
                  ? history.previous_salary.toLocaleString()
                  : "N/A"}
              </span>
              <span className="mx-2">→</span>
              <span>
                New: $
                {!isNaN(history.new_salary) && history.new_salary >= 0
                  ? history.new_salary.toLocaleString()
                  : "N/A"}
              </span>
            </div>
            {index < sortedHistory.length - 1 && <Separator className="my-4" />}
          </div>
        );
      })}
    </div>
  );
}
