/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

interface DonutChartProps {
  completed: number;
  total: number;
}

export function DonutChart({ completed, total }: DonutChartProps) {
  const data = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [completed, total - completed],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(220, 220, 220, 0.6)",
        ],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(220, 220, 220, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
    cutout: "70%",
  };

  return (
    <Card>
      <CardContent className="flex justify-center items-center p-4">
        <div className="w-[150px] h-[150px]">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
