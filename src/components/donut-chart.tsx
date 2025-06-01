"use client";

import { useEffect, useRef } from "react";

export function DonutChart({ completed, total }) {
  const canvasRef = useRef(null);
  const percentage = Math.round((completed / total) * 100) || 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#e5e7eb"; // Light gray
    ctx.fill();

    // Draw progress arc
    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius,
      -Math.PI / 2,
      -Math.PI / 2 + (2 * Math.PI * percentage) / 100
    );
    ctx.fillStyle = "#024023"; // Primary color
    ctx.fill();

    // Draw inner circle (to create donut)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();

    // Draw text
    ctx.fillStyle = "#000000";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${percentage}%`, centerX, centerY);

    ctx.font = "12px sans-serif";
    ctx.fillText("Completed", centerX, centerY + 24);
  }, [completed, total, percentage]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={200} height={200} />
      <div className="text-sm text-center mt-2">
        <span className="font-medium">{completed}</span> of{" "}
        <span className="font-medium">{total}</span> tasks completed
      </div>
    </div>
  );
}
