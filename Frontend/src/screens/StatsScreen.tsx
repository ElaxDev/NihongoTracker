import { useQuery } from '@tanstack/react-query';
import { getUserLogsFn } from '../api/trackerApi';
import { useOutletContext } from 'react-router-dom';
import { OutletProfileContextType } from '../types';
import { ILog } from '../types';
import PieChart from '../components/PieChart';
import { useEffect, useState, useCallback } from 'react';
import SpeedChart from '../components/SpeedChart';
import ProgressChart from '../components/ProgressChart';
import { numberWithCommas } from '../utils/utils';

function StatsScreen() {
  const { username } = useOutletContext<OutletProfileContextType>();
  const [currentType, setCurrentType] = useState<string>('all');
  const [typeFilteredLogs, setTypeFilteredLogs] = useState<ILog[]>([]);
  const [timeRange, setTimeRange] = useState<
    'today' | 'month' | 'year' | 'total'
  >('total');

  const { data: logs } = useQuery({
    queryKey: ['logs'],
    queryFn: () =>
      getUserLogsFn(username as string, {
        limit: 0,
        page: 1,
      }),
    staleTime: Infinity,
  });

  const filterLogsByTimeRange = (logs: ILog[]) => {
    if (!logs) return [];

    const now = new Date();

    switch (timeRange) {
      case 'today':
        return logs.filter((log) => {
          const logDate = new Date(log.date);
          return (
            logDate.getDate() === now.getDate() &&
            logDate.getMonth() === now.getMonth() &&
            logDate.getFullYear() === now.getFullYear()
          );
        });
      case 'month':
        return logs.filter((log) => {
          const logDate = new Date(log.date);
          return (
            logDate.getMonth() === now.getMonth() &&
            logDate.getFullYear() === now.getFullYear()
          );
        });
      case 'year':
        return logs.filter((log) => {
          const logDate = new Date(log.date);
          return logDate.getFullYear() === now.getFullYear();
        });
      case 'total':
      default:
        return logs;
    }
  };

  const timeFilteredLogs = filterLogsByTimeRange(logs || []);

  const totalHours = timeFilteredLogs
    ? timeFilteredLogs
        .reduce((total, log: ILog) => {
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
        }, 0)
        .toFixed(1)
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

  const filteredLogs = timeFilteredLogs
    ? currentType === 'all'
      ? timeFilteredLogs
      : timeFilteredLogs.filter((log: ILog) => log.type === currentType)
    : [];

  const filterLogsByType = useCallback(
    (type: string): ILog[] => {
      if (currentType !== 'all' && type !== currentType) {
        return [];
      }
      return timeFilteredLogs?.filter((log: ILog) => log.type === type) ?? [];
    },
    [currentType, timeFilteredLogs]
  );

  useEffect(() => {
    if (logs) {
      setTypeFilteredLogs(
        currentType === 'all' ? logs : filterLogsByType(currentType)
      );
    }
  }, [logs, currentType, filterLogsByType]);

  const logCountData = {
    labels: currentType === 'all' ? logTypes : [currentType],
    datasets: [
      {
        label: 'Count',
        data:
          currentType === 'all'
            ? logTypes.map((type) => filterLogsByType(type).length)
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

  const getTimeSpentData = (type: string) => {
    if (currentType !== 'all' && type !== currentType) {
      return 0;
    }

    const totalHours =
      timeFilteredLogs
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

  const getXpData = (type: string) => {
    if (currentType !== 'all' && type !== currentType) {
      return 0;
    }

    return (
      timeFilteredLogs
        ?.filter((log: ILog) => log.type === type)
        .reduce((acc, log) => acc + log.xp, 0) ?? 0
    );
  };

  const calculateTotalXp = () => {
    return filteredLogs.reduce((acc, log) => acc + log.xp, 0);
  };

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

  return (
    <div className="2xl:max-w-(--breakpoint-2xl) 2xl:min-w-[50%] min-w-full 2xl:px-0 px-10 mb-24 mt-4">
      <div className="grid lg:grid-cols-[20%_80%] gap-5">
        <div className="sticky top-4 self-start h-fit card bg-base-100 p-4">
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

          <div className="mt-4">
            <div className="font-bold text-xl mb-2">Time Range</div>
            <select
              className="select select-bordered w-full"
              value={timeRange}
              onChange={(e) =>
                setTimeRange(
                  e.target.value as 'today' | 'month' | 'year' | 'total'
                )
              }
            >
              <option value="today">Today</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="total">All Time</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {/* Stats summary cards */}
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">Total XP</div>
              <div className="stat-value text-primary">
                {currentType === 'all'
                  ? numberWithCommas(
                      filteredLogs.reduce((sum, log) => sum + log.xp, 0)
                    )
                  : numberWithCommas(getXpData(currentType))}
              </div>
              <div className="stat-desc">
                {currentType === 'all'
                  ? `${timeRange === 'total' ? 'All time' : timeRange === 'today' ? "Today's" : timeRange === 'month' ? "This Month's" : "This Year's"}`
                  : `${currentType.charAt(0).toUpperCase() + currentType.slice(1)} category`}
              </div>
            </div>

            <div className="stat">
              <div className="stat-title">Time Spent</div>
              <div className="stat-value text-secondary">
                {currentType === 'all'
                  ? numberWithCommas(parseFloat(totalHours))
                  : numberWithCommas(
                      parseFloat(getTimeSpentData(currentType).toFixed(1))
                    )}
                <span className="text-lg">h</span>
              </div>
              <div className="stat-desc">
                {currentType === 'all'
                  ? `${timeRange === 'total' ? 'All time' : timeRange === 'today' ? 'Today' : timeRange === 'month' ? 'This Month' : 'This Year'}`
                  : `${currentType.charAt(0).toUpperCase() + currentType.slice(1)} category`}
              </div>
            </div>

            <div className="stat">
              <div className="stat-title">Logs Count</div>
              <div className="stat-value text-accent">
                {currentType === 'all'
                  ? numberWithCommas(filteredLogs.length)
                  : numberWithCommas(filterLogsByType(currentType).length)}
              </div>
              <div className="stat-desc">
                {currentType !== 'all' &&
                  `${currentType.charAt(0).toUpperCase() + currentType.slice(1)} logs`}
                {untrackedLogs.length > 0 && currentType === 'all' && (
                  <span className="text-warning">{` (${untrackedLogs.length} untracked)`}</span>
                )}
              </div>
            </div>
          </div>

          {currentType === 'all' && (
            <div className="flex flex-col lg:flex-row justify-between gap-7">
              <div className="card bg-base-100 p-4">
                <div className="max-h-64 max-w-64">
                  <h2 className="text-2xl font-bold text-primary">Log Count</h2>
                  <PieChart data={logCountData} />
                </div>
              </div>
              <div className="card bg-base-100 p-4">
                <div className="max-h-64 max-w-64">
                  <h2 className="text-2xl font-bold text-primary">Log Hours</h2>
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
          )}
          {currentType === 'all' ||
          currentType === 'reading' ||
          currentType === 'manga' ||
          currentType === 'vn' ? (
            <div className="card bg-base-100 grow p-8 mb-4">
              <div className="h-full w-full">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  Reading Speed
                </h2>
                <div className="h-full w-full">
                  <SpeedChart
                    timeframe={timeRange}
                    readingData={typeFilteredLogs}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="card bg-base-100 grow p-8 mb-4">
            <div className="h-full w-full">
              <ProgressChart timeframe={timeRange} logs={typeFilteredLogs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsScreen;
