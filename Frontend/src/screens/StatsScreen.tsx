import { useQuery } from '@tanstack/react-query';
import { getUserStatsFn } from '../api/trackerApi';
import { useOutletContext } from 'react-router-dom';
import { OutletProfileContextType } from '../types';
import PieChart from '../components/PieChart';
import { useState } from 'react';
import SpeedChart from '../components/SpeedChart';
import ProgressChart from '../components/ProgressChart';
import { numberWithCommas } from '../utils/utils';

function StatsScreen() {
  const { username } = useOutletContext<OutletProfileContextType>();
  const [currentType, setCurrentType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<
    'today' | 'month' | 'year' | 'total'
  >('total');

  // Use the getUserStatsFn instead of getUserLogsFn
  const { data: userStats, isLoading } = useQuery({
    queryKey: ['userStats', username, timeRange, currentType],
    queryFn: () =>
      getUserStatsFn(username as string, { timeRange, type: currentType }),
    staleTime: Infinity,
    enabled: !!username,
  });

  const logTypes = [
    'reading',
    'anime',
    'vn',
    'video',
    'manga',
    'audio',
    'other',
  ];

  // Create chart data from the pre-aggregated stats
  const logCountData = {
    labels:
      userStats?.statsByType.map((stat) =>
        stat.type === 'vn' ? 'Visual Novel' : stat.type
      ) || [],
    datasets: [
      {
        label: 'Count',
        data: userStats?.statsByType.map((stat) => stat.count) || [],
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

  const logTimeData = {
    labels:
      userStats?.statsByType.map((stat) =>
        stat.type === 'vn' ? 'Visual Novel' : stat.type
      ) || [],
    datasets: [
      {
        label: 'Time Spent (hours)',
        data: userStats?.statsByType.map((stat) => stat.totalTimeHours) || [],
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

  const logXpData = {
    labels:
      userStats?.statsByType.map((stat) =>
        stat.type === 'vn' ? 'Visual Novel' : stat.type
      ) || [],
    datasets: [
      {
        label: 'XP',
        data: userStats?.statsByType.map((stat) => stat.totalXp) || [],
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

  // Get the current type stats or use the aggregated totals
  const currentTypeStats =
    currentType === 'all'
      ? userStats?.totals
      : userStats?.statsByType.find((stat) => stat.type === currentType);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

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
                {currentTypeStats
                  ? numberWithCommas(currentTypeStats.totalXp)
                  : 0}
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
                {currentTypeStats
                  ? numberWithCommas(
                      parseFloat(currentTypeStats.totalTimeHours.toFixed(1))
                    )
                  : 0}
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
                {currentTypeStats
                  ? numberWithCommas(
                      currentType === 'all'
                        ? userStats?.totals.totalLogs
                        : 'count' in currentTypeStats
                          ? currentTypeStats.count
                          : 0
                    )
                  : 0}
              </div>
              <div className="stat-desc">
                {currentType !== 'all' &&
                  `${currentType.charAt(0).toUpperCase() + currentType.slice(1)} logs`}
                {currentType === 'all' && (
                  <span className={userStats?.totals.untrackedCount ? "text-warning" : ""}>
                    {` (${userStats?.totals.untrackedCount || 0} untracked)`}
                  </span>
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
          {(currentType === 'all' ||
            currentType === 'reading' ||
            currentType === 'manga' ||
            currentType === 'vn') &&
            userStats?.readingSpeedData && (
              <div className="card bg-base-100 grow p-8 mb-4">
                <div className="h-full w-full">
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    Reading Speed
                  </h2>
                  <div className="h-full w-full">
                    <SpeedChart
                      timeframe={timeRange}
                      readingSpeedData={userStats.readingSpeedData}
                    />
                  </div>
                </div>
              </div>
            )}

          <div className="card bg-base-100 grow p-8 mb-4">
            <div className="h-full w-full">
              <ProgressChart
                timeframe={timeRange}
                statsData={userStats?.statsByType}
                selectedType={currentType}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsScreen;
