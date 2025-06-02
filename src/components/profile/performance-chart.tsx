"use client";

import { TaskType } from "@/app/api/get-user-task/route";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

export type PerformanceChartCardType = {
  created_at: string; // Thời gian tạo, dùng để nhóm theo tháng
  status: "pending" | "completed" | "failed" | "in_progress"; // Trạng thái, dùng để tính tỷ lệ hoàn thành
};

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceChartProps {
  tasks: TaskType[];
}

export function PerformanceChart({ tasks }: PerformanceChartProps) {
  // Nhóm task theo tháng dựa trên created_at
  const groupTasksByMonth = (tasks: TaskType[]) => {
    const grouped: { [key: string]: TaskType[] } = {};
    tasks.forEach((task) => {
      const date = new Date(task.created_at);
      const monthYear = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }); // Ví dụ: "Jan 2025"
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(task);
    });
    return grouped;
  };

  // Tính tỷ lệ hoàn thành cho mỗi tháng
  const groupedTasks = groupTasksByMonth(tasks);
  const sortedMonths = Object.keys(groupedTasks).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const completionRates = sortedMonths.map((month) => {
    const monthTasks = groupedTasks[month];
    const totalTasks = monthTasks.length;
    const completedTasks = monthTasks.filter(
      (task) => task.status === "completed"
    ).length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  });

  // Tính tỷ lệ hoàn thành trung bình
  const totalTasks = tasks.length;
  const totalCompleted = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const avgCompletionRate =
    totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

  const data = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Completion Rate (%)",
        data: completionRates,
        borderColor: "#10b981", // Tailwind emerald-500
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
        fill: true,
        pointBorderColor: "#10b981",
        pointBackgroundColor: "#fff",
        pointRadius: 5,
      },
      {
        label: `Average (${avgCompletionRate.toFixed(1)}%)`,
        data: Array(completionRates.length).fill(avgCompletionRate),
        borderColor: "#f59e0b", // Tailwind amber-500
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
        },
        grid: {
          color: "#e2e8f0", // Tailwind slate-200
        },
        title: {
          display: true,
          text: "Completion Rate (%)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Month",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => `Completion Rate: ${ctx.raw.toFixed(1)}%`,
        },
      },
    },
  };

  return (
    <div className="relative h-full w-full">
      <Line data={data} options={options} />
    </div>
  );
}
