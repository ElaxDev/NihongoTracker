import { useQuery } from '@tanstack/react-query';
import { getUserLogsFn } from '../api/trackerApi';
import { useOutletContext } from 'react-router-dom';
import { OutletProfileContextType } from '../types';
import { ILog } from '../types';
import PieChart from '../components/PieChart';
import LineChart from '../components/LineChart';
import { ChartArea, ScriptableContext } from 'chart.js';
import { useState } from 'react';

function StatsScreen() {
  const { user, username } = useOutletContext<OutletProfileContextType>();
  const [currentType, setCurrentType] = useState<string>('all');

  const { data: logs } = useQuery({
    queryKey: ['logs'],
    queryFn: () =>
      getUserLogsFn(username as string, {
        limit: 0,
        page: 1,
      }),
    staleTime: Infinity,
  });

  // Calculate total hours from logs instead of using user.stats fields
  const totalHours = logs
    ? logs.reduce((total, log: ILog) => {
        if (log.type === 'anime' && log.time) {
          return total + log.time / 60;
        } else if (log.type === 'anime' && !log.time) {
          // For anime logs without time but with episodes
          if (log.episodes) {
            return total + (log.episodes * 24) / 60;
          }
          return total;
        } else {
          // For all other log types
          if (log.time) {
            return total + log.time / 60;
          }
          return total;
        }
      }, 0).toFixed(1)
    : '0.0';

  const logTypes = [
    'reading',
    'anime',
    'vn',
    'video',
    'manga',
    'audio',
    'other',
  ];

  // Filter logs based on currentType
  const filteredLogs = logs
    ? currentType === 'all'
      ? logs
      : logs.filter((log: ILog) => log.type === currentType)
    : [];

  // Get logs count by type (for chart data)
  const getLogCountByType = (type: string) => {
    if (currentType !== 'all' && type !== currentType) {
      return 0;
    }
    return logs?.filter((log: ILog) => log.type === type).length ?? 0;
  };

  // Chart data for log count
  const logCountData = {
    labels: currentType === 'all' ? logTypes : [currentType],
    datasets: [
      {
        label: 'Count',
        data:
          currentType === 'all'
            ? logTypes.map((type) => getLogCountByType(type))
            : [filteredLogs.length],
        backgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const untrackedLogs = filteredLogs.filter(
    (log: ILog) =>
      (log.type === 'anime' && !log.time && !log.episodes) ||
      (log.type !== 'anime' && !log.time)
  );

  // Get time spent data
  const getTimeSpentData = (type: string) => {
    if (currentType !== 'all' && type !== currentType) {
      return 0;
    }

    const totalHours =
      logs
        ?.filter((log: ILog) => log.type === type)
        .reduce((total, log) => {
          if (log.type === 'anime' && log.time) {
            return total + log.time / 60;
          } else if (log.type === 'anime' && !log.time) {
            if (log.episodes) {
              return total + (log.episodes * 24) / 60;
            }
            return total;
          } else {
            if (log.time) {
              return total + log.time / 60;
            }
            return total;
          }
        }, 0) ?? 0;
    return totalHours;
  };

  // Calculate time spent from filtered logs
  const calculateTimeSpent = () => {
    return filteredLogs.reduce((total, log) => {
      if (log.type === 'anime' && log.time) {
        return total + log.time / 60;
      } else if (log.type === 'anime' && !log.time) {
        if (log.episodes) {
          return total + (log.episodes * 24) / 60;
        }
        return total;
      } else {
        if (log.time) {
          return total + log.time / 60;
        }
        return total;
      }
    }, 0);
  };

  // Chart data for time spent
  const logTimeData = {
    labels: currentType === 'all' ? logTypes : [currentType],
    datasets: [
      {
        label: 'Time Spent (hours)',
        data:
          currentType === 'all'
            ? logTypes.map((type) => getTimeSpentData(type))
            : [calculateTimeSpent()],
        backgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Get XP data
  const getXpData = (type: string) => {
    if (currentType !== 'all' && type !== currentType) {
      return 0;
    }

    return (
      logs
        ?.filter((log: ILog) => log.type === type)
        .reduce((acc, log) => acc + log.xp, 0) ?? 0
    );
  };

  // Calculate total XP from filtered logs
  const calculateTotalXp = () => {
    return filteredLogs.reduce((acc, log) => acc + log.xp, 0);
  };

  // Chart data for XP
  const logXpData = {
    labels: currentType === 'all' ? logTypes : [currentType],
    datasets: [
      {
        label: 'XP',
        data:
          currentType === 'all'
            ? logTypes.map((type) => getXpData(type))
            : [calculateTotalXp()],
        backgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  function filterLogsForPeriod(logs: ILog[]) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const logsForPeriod = logs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate.getFullYear() === currentYear;
    });
    return logsForPeriod;
  }

  function getReadingSpeed(
    logs: ILog[],
    types: string[] = ['reading', 'manga', 'vn']
  ) {
    const filteredLogs = filterLogsForPeriod(logs);
    const readingSpeeds: { [key: number]: { sum: number; count: number } } = {};
    filteredLogs.forEach((log) => {
      const month = new Date(log.date).getMonth();
      if (log.type === 'manga')
        console.log(
          'chars',
          log.chars,
          'time',
          log.time,
          'speed',
          log.chars ?? 0 / (log.time ?? 0 / 60)
        );
      if (!types.includes(log.type)) return;
      if (!log.chars || !log.time) return;
      const LogReadingSpeed = log.chars / (log.time / 60);
      if (!readingSpeeds[month]) {
        readingSpeeds[month] = { sum: 0, count: 0 };
      }
      readingSpeeds[month].sum += LogReadingSpeed;
      readingSpeeds[month].count++;
    });
    return Object.keys(readingSpeeds).map((month) => ({
      month: parseInt(month),
      averageSpeed:
        readingSpeeds[parseInt(month)].sum /
        readingSpeeds[parseInt(month)].count,
    }));
  }

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
  const readingSpeedsManga = getReadingSpeed(logs ?? [], ['manga']);
  const readingSpeedsVn = getReadingSpeed(logs ?? [], ['vn']);
  const readingSpeedsReading = getReadingSpeed(logs ?? [], ['reading']);

  function completeData(
    speedArray: { month: number; averageSpeed: number }[]
  ): number[] {
    const readingSpeed = speedArray.map((speed) => speed.averageSpeed);
    if (readingSpeed.length < 12) {
      for (
        let i = readingSpeed.length;
        i < months.slice(0, new Date().getMonth() + 1).length;
        i++
      ) {
        readingSpeed.push(0);
      }
    }
    return readingSpeed;
  }

  const readingSpeedData = {
    labels: months.slice(0, new Date().getMonth() + 1),
    datasets: [
      {
        label: 'Reading Speed (manga)',
        data: completeData(readingSpeedsManga),
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
      {
        label: 'Reading Speed (visual novels)',
        data: completeData(readingSpeedsVn),
        fill: true,
        pointRadius: 3,
        borderColor: 'rgb(250, 50, 170)',
        backgroundColor: function (context: ScriptableContext<'line'>) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          return createGradient(ctx, chartArea, 'rgb(250, 50, 170)');
        },
        tension: 0.1,
      },
      {
        label: 'Reading Speed (reading)',
        data: completeData(readingSpeedsReading),
        fill: true,
        pointRadius: 3,
        borderColor: 'rgb(50, 250, 170)',
        backgroundColor: function (context: ScriptableContext<'line'>) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          return createGradient(ctx, chartArea, 'rgb(50, 250, 170)');
        },
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="2xl:max-w-(--breakpoint-2xl) 2xl:min-w-[50%] min-w-full 2xl:px-0 px-10 mb-24 mt-4">
      <div className="grid lg:grid-cols-[20%_80%] gap-5">
        <div className="card bg-base-100 p-4">
          <div className="font-bold text-xl">Types</div>
          <ul className="menu card-body">
            <li
              className={currentType === 'all' ? 'bg-base-200 rounded-btn' : ''}
            >
              <a onClick={() => setCurrentType('all')}>All</a>
            </li>
            {logTypes.map((type) => (
              <li
                key={type}
                className={`capitalize ${
                  currentType === type ? 'bg-base-200 rounded-btn' : ''
                }`}
              >
                <a onClick={() => setCurrentType(type)}>
                  {type === 'vn' ? 'Visual Novel' : type}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-around">
            <div>
              <h2 className="text-xl font-bold text-primary">
                {currentType === 'all'
                  ? user?.stats.userXp
                  : getXpData(currentType)}{' '}
                XP
              </h2>
              <h4>
                {currentType === 'all'
                  ? 'Total XP'
                  : `${currentType.charAt(0).toUpperCase() + currentType.slice(1)} XP`}
              </h4>
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">
                {currentType === 'all'
                  ? totalHours
                  : getTimeSpentData(currentType).toFixed(1)}
                h
              </h2>
              <h4>
                {currentType === 'all'
                  ? 'Total Hours'
                  : `${currentType.charAt(0).toUpperCase() + currentType.slice(1)} Hours`}
              </h4>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row justify-center gap-7">
            <div className="card bg-base-100 p-4">
              <div className="max-h-64 max-w-64">
                <h2 className="text-2xl font-bold text-primary">Log Count</h2>
                <PieChart data={logCountData} />
              </div>
            </div>
            <div className="card bg-base-100 p-4">
              <div className="max-h-64 max-w-64">
                <h2 className="text-2xl font-bold text-primary">Log Hours</h2>
                <p
                  className="text-sm text-base-content"
                  hidden={untrackedLogs.length === 0 || currentType !== 'all'}
                >{`${untrackedLogs.length} untracked logs`}</p>
                <PieChart data={logTimeData} />
              </div>
            </div>
            <div className="card bg-base-100 p-4">
              <div className="max-h-64 max-w-64">
                <h2 className="text-2xl font-bold text-primary">Log XP</h2>
                <PieChart data={logXpData} />
              </div>
            </div>
          </div>
          <div className="card bg-base-100 max-h-80 grow p-8 mb-4">
            <div className="h-full w-full">
              <h2 className="text-2xl font-bold text-primary mb-2">
                Reading Speed
              </h2>
              <div className="h-full w-full">
                <LineChart data={readingSpeedData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsScreen;
