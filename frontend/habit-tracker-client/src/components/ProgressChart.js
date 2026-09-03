import React, { useEffect, useMemo, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const ProgressChart = ({ data }) => {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "light");

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const isDark = theme === "dark";
  const maxTotal = Math.max(1, ...data.map((day) => day.total));

  const chartData = useMemo(() => ({
    labels: data.map((day) => day.day),
    datasets: [
      {
        label: "Total",
        data: data.map((day) => day.total),
        backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.08)",
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false,
        grouped: false,
        barPercentage: 0.78,
        categoryPercentage: 0.72,
        order: 2,
      },
      {
        label: "Completed",
        data: data.map((day) => day.completed),
        backgroundColor: "rgba(99,102,241,0.9)",
        borderWidth: 0,
        borderRadius: 8,
        borderSkipped: false,
        grouped: false,
        barPercentage: 0.5,
        categoryPercentage: 0.72,
        order: 1,
      },
    ],
  }), [data, isDark]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        backgroundColor: isDark ? "rgba(15,23,42,0.96)" : "rgba(248,250,252,0.98)",
        titleColor: isDark ? "#f8fafc" : "#0f172a",
        bodyColor: isDark ? "#cbd5e1" : "#475569",
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(99,102,241,0.18)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (context) => {
            const day = data[context.dataIndex];
            return `${day.completed} of ${day.total} completed`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: isDark ? "#94a3b8" : "#64748b",
          font: { family: "'Outfit', system-ui", size: 11, weight: "600" },
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: maxTotal,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: isDark ? "#64748b" : "#94a3b8",
          font: { family: "'Outfit', system-ui", size: 10 },
        },
        border: { display: false },
        grid: { color: isDark ? "rgba(255,255,255,0.045)" : "rgba(99,102,241,0.055)" },
      },
    },
    animation: { duration: 520, easing: "easeOutQuart" },
  };

  return (
    <div style={{ height: "226px" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ProgressChart;
