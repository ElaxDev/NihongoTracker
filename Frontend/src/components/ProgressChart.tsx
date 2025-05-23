import { ILog } from "../types";
import { ChartArea, ScriptableContext } from "chart.js";
import LineChart from "./LineChart";
import { useEffect, useState } from "react";

interface ProgressChartProps {
  logs: ILog[] | undefined;
  timeframe?: "today" | "month" | "year" | "total";
}

export default function ProgressChart({
  logs,
  timeframe: externalTimeframe,
}: ProgressChartProps) {
  const [timeframe, setTimeframe] = useState<
    "today" | "month" | "year" | "total"
  >("total");

  useEffect(() => {
    if (externalTimeframe) {
      setTimeframe(externalTimeframe);
    }
  }, [externalTimeframe]);

  const filteredLogs = logs ? filterLogsByTimeframe(logs, timeframe) : [];

  function filterLogsByTimeframe(logs: ILog[], timeframe: string) {
    const now = new Date();

    return logs.filter((log) => {
      const logDate = new Date(log.date);

      if (timeframe === "today") {
        return logDate.toDateString() === now.toDateString();
      } else if (timeframe === "month") {
        return (
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear()
        );
      } else if (timeframe === "year") {
        return logDate.getFullYear() === now.getFullYear();
      } else {
        return true;
      }
    });
  }

  function getXpByDate(logs: ILog[]) {
    const xpByDate: { [key: string]: number } = {};

    logs.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split("T")[0];
      if (!xpByDate[dateStr]) {
        xpByDate[dateStr] = 0;
      }
      xpByDate[dateStr] += log.xp;
    });

    return xpByDate;
  }

  function createGradient(
    ctx: CanvasRenderingContext2D,
    chartArea: ChartArea,
    color: string,
  ) {
    const { top, bottom } = chartArea;
    const gradient = ctx.createLinearGradient(0, top, 0, bottom);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(50, 170, 250, 0)");
    return gradient;
  }

  let labels: string[];
  let xpValues: number[];

  if (timeframe === "today") {
    const xpByHour: { [key: string]: number } = {};

    for (let i = 0; i < 24; i++) {
      xpByHour[i.toString()] = 0;
    }

    filteredLogs.forEach((log) => {
      const date = new Date(log.date);
      const hour = date.getHours();
      xpByHour[hour.toString()] += log.xp;
    });

    labels = Object.keys(xpByHour)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((hour) => `${hour}:00`);
    xpValues = Object.keys(xpByHour)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((hour) => xpByHour[hour]);
  } else if (timeframe === "month") {
    const xpByDate = getXpByDate(filteredLogs);
    const dates = Object.keys(xpByDate).sort();
    labels = dates.map((date) => new Date(date).getDate().toString());
    xpValues = dates.map((date) => xpByDate[date]);
  } else if (timeframe === "year") {
    const xpByMonth: { [key: string]: number } = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    filteredLogs.forEach((log) => {
      const date = new Date(log.date);
      const monthIndex = date.getMonth();
      if (!xpByMonth[monthIndex.toString()]) {
        xpByMonth[monthIndex.toString()] = 0;
      }
      xpByMonth[monthIndex.toString()] += log.xp;
    });

    const monthIndices = Object.keys(xpByMonth)
      .map(Number)
      .sort((a, b) => a - b);

    labels = monthIndices.map((monthIdx) => months[monthIdx]);
    xpValues = monthIndices.map((monthIdx) => xpByMonth[monthIdx.toString()]);
  } else {
    const xpByMonthYear: { [key: string]: number } = {};

    filteredLogs.forEach((log) => {
      const date = new Date(log.date);
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (!xpByMonthYear[yearMonth]) {
        xpByMonthYear[yearMonth] = 0;
      }
      xpByMonthYear[yearMonth] += log.xp;
    });

    const sortedKeys = Object.keys(xpByMonthYear).sort();
    labels = sortedKeys;
    xpValues = sortedKeys.map((key) => xpByMonthYear[key]);
  }

  // Check if there's actual data (sum of all values > 0)
  const hasData = xpValues.some((value) => value > 0);

  const consistencyData = {
    labels: labels,
    datasets: [
      {
        label: "XP Earned",
        data: xpValues,
        fill: true,
        pointRadius: 3,
        borderColor: "rgb(50, 170, 250)",
        backgroundColor: function (context: ScriptableContext<"line">) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          return createGradient(ctx, chartArea, "rgba(50, 170, 250, 1)");
        },
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="card bg-base-100 p-4 w-full h-full">
      <div className="h-full w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Progress</h2>
            {filteredLogs.length > 0 && hasData ? (
              <p className="text-sm text-base-content mb-4">
                {timeframe === "today"
                  ? "Hourly XP - Today"
                  : timeframe === "month"
                    ? "Daily XP - Current Month"
                    : timeframe === "year"
                      ? "XP Earned Over the Year"
                      : "Total XP Earned Over Time"}
              </p>
            ) : null}
          </div>
          {!externalTimeframe && (
            <div>
              <select
                value={timeframe}
                onChange={(e) =>
                  setTimeframe(
                    e.target.value as "today" | "month" | "year" | "total",
                  )
                }
                className="select select-bordered"
              >
                <option value="total">Total</option>
                <option value="year">Year</option>
                <option value="month">Month</option>
                <option value="today">Today</option>
              </select>
            </div>
          )}
        </div>

        <div className="max-h-80">
          <div className="h-full w-full">
            {filteredLogs.length > 0 && hasData ? (
              <LineChart data={consistencyData} />
            ) : (
              <div className="alert alert-info">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="stroke-current shrink-0 w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>No data available for the selected timeframe.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
