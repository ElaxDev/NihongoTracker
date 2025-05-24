import { Link } from 'react-router-dom';
import { useUserDataStore } from '../store/userData';
import { useQuery } from '@tanstack/react-query';
import { getRankingFn, getUserLogsFn } from '../api/trackerApi';
// import { ILog } from '../types';
import { useMemo } from 'react';
import { numberWithCommas } from '../utils/utils';

function Hero() {
  const { user } = useUserDataStore();
  const username = user?.username;

  // Fetch logs for the logged-in user
  const { data: logs } = useQuery({
    queryKey: ['logs', username],
    queryFn: () =>
      getUserLogsFn(username || '', {
        limit: 0,
        page: 1,
      }),
    staleTime: Infinity,
    enabled: !!username,
  });

  // Fetch logs for the logged-in user
  const { data: ranking } = useQuery({
    queryKey: ['ranking'],
    queryFn: () =>
      getRankingFn({
        limit: 3,
        page: 1,
        filter: 'userXp',
        timeFilter: 'all-time',
      }),
    staleTime: Infinity,
    enabled: !!username,
  });

  // Calculate immersion statistics
  const immersionStats = useMemo(() => {
    if (!logs || !logs.length) {
      return {
        currentMonth: { reading: 0, listening: 0, total: 0 },
        lastMonth: { reading: 0, listening: 0, total: 0 },
        changes: { reading: 0, listening: 0, total: 0 },
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Previous month - handle January edge case
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter logs by month
    const currentMonthLogs = logs.filter((log) => {
      const logDate = new Date(log.date);
      return (
        logDate.getMonth() === currentMonth &&
        logDate.getFullYear() === currentYear
      );
    });

    const lastMonthLogs = logs.filter((log) => {
      const logDate = new Date(log.date);
      return (
        logDate.getMonth() === lastMonth &&
        logDate.getFullYear() === lastMonthYear
      );
    });

    // Calculate reading time (manga, vn, reading)
    const currentReadingTime = currentMonthLogs
      .filter((log) => ['manga', 'vn', 'reading'].includes(log.type))
      .reduce((total, log) => total + (log.time || 0) / 60, 0);

    const lastReadingTime = lastMonthLogs
      .filter((log) => ['manga', 'vn', 'reading'].includes(log.type))
      .reduce((total, log) => total + (log.time || 0) / 60, 0);

    // Calculate listening time (anime, audio, video)
    const currentListeningTime = currentMonthLogs
      .filter((log) => ['anime', 'audio', 'video'].includes(log.type))
      .reduce((total, log) => {
        if (log.type === 'anime' && !log.time && log.episodes) {
          // If no time but episodes exist, estimate 24 minutes per episode
          return total + (log.episodes * 24) / 60;
        }
        return total + (log.time || 0) / 60;
      }, 0);

    const lastListeningTime = lastMonthLogs
      .filter((log) => ['anime', 'audio', 'video'].includes(log.type))
      .reduce((total, log) => {
        if (log.type === 'anime' && !log.time && log.episodes) {
          return total + (log.episodes * 24) / 60;
        }
        return total + (log.time || 0) / 60;
      }, 0);

    // Calculate total immersion time
    const currentTotal = currentReadingTime + currentListeningTime;
    const lastTotal = lastReadingTime + lastListeningTime;

    // Calculate percentage changes
    const calculatePercentChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const readingChange = calculatePercentChange(
      currentReadingTime,
      lastReadingTime
    );
    const listeningChange = calculatePercentChange(
      currentListeningTime,
      lastListeningTime
    );
    const totalChange = calculatePercentChange(currentTotal, lastTotal);

    return {
      currentMonth: {
        reading: parseFloat(currentReadingTime.toFixed(1)),
        listening: parseFloat(currentListeningTime.toFixed(1)),
        total: parseFloat(currentTotal.toFixed(1)),
      },
      lastMonth: {
        reading: parseFloat(lastReadingTime.toFixed(1)),
        listening: parseFloat(lastListeningTime.toFixed(1)),
        total: parseFloat(lastTotal.toFixed(1)),
      },
      changes: {
        reading: readingChange,
        listening: listeningChange,
        total: totalChange,
      },
    };
  }, [logs]);

  // Get recent logs
  const recentLogs = useMemo(() => {
    if (!logs || !Array.isArray(logs)) return [];

    return logs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map((log) => ({
        ...log,
        formattedDate: formatRelativeDate(new Date(log.date)),
        formattedTime: formatTime(log.time, log.episodes),
      }));
  }, [logs]);

  // Helper function to format relative dates
  function formatRelativeDate(date: Date) {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  // Helper function to format time
  function formatTime(minutes?: number, episodes?: number) {
    if (minutes && minutes > 0) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
    } else if (episodes) {
      return `${episodes} ep${episodes > 1 ? 's' : ''}`;
    }
    return 'N/A';
  }

  return (
    <div className="hero min-h-screen bg-base-200">
      {!user ? (
        // Content for logged out users (marketing view)
        <div className="hero-content flex-col lg:flex-row-reverse gap-12">
          <div className="max-w-sm lg:max-w-md">
            <div className="card card-bordered shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-center justify-center border-b pb-2">
                  学習の進捗 (Learning Progress)
                </h2>

                <div className="grid grid-cols-1 gap-6 mt-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary text-primary-content p-4 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="w-8 h-8 stroke-current"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-lg font-bold">Reading - 読む</div>
                      <div className="text-3xl font-extrabold">42</div>
                      <div className="text-sm opacity-70">books completed</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-secondary text-secondary-content p-4 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="w-8 h-8 stroke-current"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-lg font-bold">Listening - 聞く</div>
                      <div className="text-3xl font-extrabold">156</div>
                      <div className="text-sm opacity-70">hours immersed</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-success text-success-content p-4 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="w-8 h-8 stroke-current"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 19.5h18M5 17l3.5-3.5m0 0l3 3L18 10"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-lg font-bold">Immersion - 浸す</div>
                      <div className="text-3xl font-extrabold">215</div>
                      <div className="text-sm opacity-70">
                        total hours this month
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-actions justify-center mt-4 pt-2 border-t">
                  <div className="stats shadow stats-horizontal bg-base-100">
                    <div className="stat place-items-center">
                      <div className="stat-title">Rank</div>
                      <div className="stat-value text-2xl">3rd</div>
                      <div className="stat-desc">among friends</div>
                    </div>
                    <div className="stat place-items-center">
                      <div className="stat-title">Streak</div>
                      <div className="stat-value text-2xl text-success">12</div>
                      <div className="stat-desc">consecutive days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-bold">NihongoTracker</h1>
            <p className="py-6">
              <b className="text-primary">Gamify</b> your Japanese immersion
              journey with NihongoTracker.
              <br />
              Track, compete, and learn with friends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link className="btn btn-primary" to="/login">
                Get Started
              </Link>
              <Link className="btn btn-outline" to="/features">
                Tour Features
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <div className="badge badge-outline">読む Reading</div>
              <div className="badge badge-outline">聞く Listening</div>
              <div className="badge badge-outline">浸す Immersion</div>
              <div className="badge badge-outline">統計 Statistics</div>
            </div>
          </div>
        </div>
      ) : (
        // Content for logged in users (dashboard view)
        <div className="hero-content flex-col lg:flex-row w-full max-w-6xl mx-auto pt-20">
          <div className="lg:w-2/3">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold">
                  Welcome back, {user.username}!
                </h1>
                <div className="stats bg-base-100 shadow">
                  <div className="stat">
                    <div className="stat-title">Current Streak</div>
                    <div className="stat-value text-success">
                      {user.stats?.currentStreak ?? 0}
                    </div>
                    <div className="stat-desc">
                      day
                      {user.stats?.currentStreak && user.stats.currentStreak > 1
                        ? 's'
                        : ''}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <Link to="/createlog" className="btn btn-primary">
                      Add Immersion
                    </Link>
                    <Link
                      to={`/user/${user.username}`}
                      className="btn btn-secondary"
                    >
                      View Profile
                    </Link>
                    <Link to="/ranking" className="btn btn-accent">
                      Check Ranking
                    </Link>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Recent Activity</h2>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Media</th>
                          <th>Type</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentLogs.length > 0 ? (
                          recentLogs.map((log) => (
                            <tr key={log._id}>
                              <td>{log.formattedDate}</td>
                              <td>{log.description}</td>
                              <td className="capitalize">{log.type}</td>
                              <td>{log.formattedTime}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center">
                              No recent logs found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="card-actions justify-end">
                    <Link to="/logs" className="btn btn-sm btn-ghost">
                      View All Logs
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Monthly Progress</h2>
                <div className="stats stats-vertical shadow">
                  <div className="stat">
                    <div className="stat-title">Reading</div>
                    <div className="stat-value text-primary">
                      {immersionStats.currentMonth.reading}h
                    </div>
                    <div className="stat-desc">
                      {immersionStats.changes.reading > 0 ? (
                        <span className="text-success">
                          ↗︎ {immersionStats.changes.reading}% more than last
                          month
                        </span>
                      ) : immersionStats.changes.reading < 0 ? (
                        <span className="text-error">
                          ↘︎ {Math.abs(immersionStats.changes.reading)}% less
                          than last month
                        </span>
                      ) : (
                        <span>Same as last month</span>
                      )}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Listening</div>
                    <div className="stat-value text-secondary">
                      {immersionStats.currentMonth.listening}h
                    </div>
                    <div className="stat-desc">
                      {immersionStats.changes.listening > 0 ? (
                        <span className="text-success">
                          ↗︎ {immersionStats.changes.listening}% more than last
                          month
                        </span>
                      ) : immersionStats.changes.listening < 0 ? (
                        <span className="text-error">
                          ↘︎ {Math.abs(immersionStats.changes.listening)}% less
                          than last month
                        </span>
                      ) : (
                        <span>Same as last month</span>
                      )}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Total Immersion</div>
                    <div className="stat-value">
                      {immersionStats.currentMonth.total}h
                    </div>
                    <div className="stat-desc">
                      {immersionStats.changes.total > 0 ? (
                        <span className="text-success">
                          ↗︎ {immersionStats.changes.total}% more than last
                          month
                        </span>
                      ) : immersionStats.changes.total < 0 ? (
                        <span className="text-error">
                          ↘︎ {Math.abs(immersionStats.changes.total)}% less
                          than last month
                        </span>
                      ) : (
                        <span>Same as last month</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-actions justify-end mt-4">
                  <Link
                    to={`/user/${user.username}/stats`}
                    className="btn btn-sm btn-outline"
                  >
                    Detailed Stats
                  </Link>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl mt-6">
              <div className="card-body">
                <h2 className="card-title">Leaderboard</h2>
                <div className="overflow-x-auto">
                  <table className="table table-xs">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>XP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking?.map((ranking, index) => (
                        <tr
                          key={ranking.username}
                          className={`hover ${ranking.username === user.username ? 'bg-base-200' : ''}`}
                        >
                          <td>{index + 1}</td>
                          <td>
                            <Link to={`/user/${ranking.username}`}>
                              {ranking.username}
                            </Link>
                          </td>
                          <td>
                            {numberWithCommas(ranking.stats?.userXp ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card-actions justify-end">
                  <Link to="/ranking" className="btn btn-sm btn-ghost">
                    View Full Ranking
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hero;
