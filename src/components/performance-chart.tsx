"use client";

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
import type { PerformanceReviewType } from "@/types/types";
import { formatDateLong } from "@/utils/dateFormatter";

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
  performanceData: PerformanceReviewType[];
}

export function PerformanceChart({ performanceData }: PerformanceChartProps) {
  const sortedData = [...performanceData].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const labels = sortedData.map((item) => formatDateLong(item.created_at));

  const ratings = sortedData.map((item) => item.rating);

  const avgRating =
    ratings.reduce((sum, value) => sum + value, 0) / ratings.length;

  const data = {
    labels,
    datasets: [
      {
        label: "Rating",
        data: ratings,
        borderColor: "#10b981", // Tailwind emerald-500
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
        fill: true,
        pointBorderColor: "#10b981",
        pointBackgroundColor: "#fff",
        pointRadius: 5,
      },
      {
        label: `Average (${avgRating.toFixed(1)})`,
        data: Array(ratings.length).fill(avgRating),
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
        max: 10,
        ticks: {
          stepSize: 2,
        },
        grid: {
          color: "#e2e8f0", // Tailwind slate-200
        },
      },
      x: {
        grid: {
          display: false,
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
          label: (ctx: any) => `Rating: ${ctx.raw}`,
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
