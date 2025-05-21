import { ILog } from '../types';
import { ChartArea, ScriptableContext } from 'chart.js';
import LineChart from './LineChart';
import { useState } from 'react';

interface ProgressChartProps {
  logs: ILog[] | undefined;
}

export default function ProgressChart({ logs }: ProgressChartProps) {
  const [timeframe, setTimeframe] = useState<'month' | 'year' | 'total'>(
    'total'
  );

  // Filter logs based on timeframe and mediaId
  const filteredLogs = logs ? filterLogsByTimeframe(logs, timeframe) : [];

  // Function to filter logs by timeframe and mediaId
  function filterLogsByTimeframe(logs: ILog[], timeframe: string) {
    const now = new Date();

    // Then filter by timeframe
    return logs.filter((log) => {
      const logDate = new Date(log.date);

      if (timeframe === 'month') {
        return (
          logDate.getMonth() === now.getMonth() &&
          logDate.getFullYear() === now.getFullYear()
        );
      } else if (timeframe === 'year') {
        return logDate.getFullYear() === now.getFullYear();
      } else {
        return true;
      }
    });
  }

  // Group logs by date and calculate total XP per day
  function getXpByDate(logs: ILog[]) {
    const xpByDate: { [key: string]: number } = {};

    logs.forEach((log) => {
      const dateStr = new Date(log.date).toISOString().split('T')[0];
      if (!xpByDate[dateStr]) {
        xpByDate[dateStr] = 0;
      }
      xpByDate[dateStr] += log.xp;
    });

    return xpByDate;
  }

  // Create gradient for chart background
  function createGradient(
    ctx: CanvasRenderingContext2D,
    chartArea: ChartArea,
    color: string
  ) {
    const { top, bottom } = chartArea;
    const gradient = ctx.createLinearGradient(0, top, 0, bottom);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(50, 170, 250, 0)');
    return gradient;
  }

  // Prepare data for chart
  let labels: string[] = [];
  let xpValues: number[] = [];

  if (timeframe === 'month') {
    // For month view - daily data (unchanged)
    const xpByDate = getXpByDate(filteredLogs);
    const dates = Object.keys(xpByDate).sort();
    labels = dates.map((date) => new Date(date).getDate().toString());
    xpValues = dates.map((date) => xpByDate[date]);
  } else if (timeframe === 'year') {
    // For year view - aggregate by month (only showing months with data)
    const xpByMonth: { [key: string]: number } = {};
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Sum XP for each month (without initializing all months to 0)
    filteredLogs.forEach((log) => {
      const date = new Date(log.date);
      const monthIndex = date.getMonth();
      if (!xpByMonth[monthIndex.toString()]) {
        xpByMonth[monthIndex.toString()] = 0;
      }
      xpByMonth[monthIndex.toString()] += log.xp;
    });

    // Create labels and data points in month order (only for months with data)
    const monthIndices = Object.keys(xpByMonth)
      .map(Number)
      .sort((a, b) => a - b);

    labels = monthIndices.map((monthIdx) => months[monthIdx]);
    xpValues = monthIndices.map((monthIdx) => xpByMonth[monthIdx.toString()]);
  } else {
    // For total view - group by month-year (unchanged)
    const xpByMonthYear: { [key: string]: number } = {};

    filteredLogs.forEach((log) => {
      const date = new Date(log.date);
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;

      if (!xpByMonthYear[yearMonth]) {
        xpByMonthYear[yearMonth] = 0;
      }
      xpByMonthYear[yearMonth] += log.xp;
    });

    const sortedKeys = Object.keys(xpByMonthYear).sort();
    labels = sortedKeys;
    xpValues = sortedKeys.map((key) => xpByMonthYear[key]);
  }

  // Chart data
  const consistencyData = {
    labels: labels,
    datasets: [
      {
        label: 'XP Earned',
        data: xpValues,
        fill: true,
        pointRadius: 3,
        borderColor: 'rgb(50, 170, 250)',
        backgroundColor: function (context: ScriptableContext<'line'>) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          return createGradient(ctx, chartArea, 'rgba(50, 170, 250, 1)');
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
            <h2 className="text-xl font-bold text-primary mb-2">Progress</h2>
            <p className="text-sm text-base-content mb-4">
              {timeframe === 'month'
                ? 'Daily XP - Current Month'
                : timeframe === 'year'
                  ? 'XP Earned Over the Year'
                  : 'Total XP Earned Over Time'}
            </p>
          </div>
          <div>
            <select
              value={timeframe}
              onChange={(e) =>
                setTimeframe(e.target.value as 'month' | 'year' | 'total')
              }
              className="select"
            >
              <option value="total">Total</option>
              <option value="year">Year</option>
              <option value="month">Month</option>
            </select>
          </div>
        </div>

        <div className="max-h-80">
          <div className="h-full w-full">
            {filteredLogs.length > 0 ? (
              <LineChart data={consistencyData} />
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-base-content">
                  No data available for the selected criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
