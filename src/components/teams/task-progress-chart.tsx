/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface TaskProgressChartProps {
  completionData: { teamName: string; completionRate: number }[];
}

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export function TaskProgressChart({ completionData }: TaskProgressChartProps) {
  const { resolvedTheme } = useTheme();
  const [textColor, setTextColor] = useState("#333");

  useEffect(() => {
    setTextColor(resolvedTheme === "dark" ? "#eee" : "#333");
  }, [resolvedTheme]);

  const labels = completionData.map((data) => data.teamName);
  const data = {
    labels,
    datasets: [
      {
        label: "Task Completion Rate (%)",
        data: completionData.map((data) => data.completionRate),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Completion Rate (%)",
          color: textColor,
        },
        ticks: {
          color: textColor,
        },
      },
      x: {
        title: {
          display: true,
          text: "Teams",
          color: textColor,
        },
        ticks: {
          color: textColor,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
          },
        },
      },
    },
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Teams Task Progress Overview</CardTitle>
        <CardDescription>
          Task completion progress across all teams
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
