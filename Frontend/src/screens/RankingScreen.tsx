import { useInfiniteQuery } from '@tanstack/react-query';
import { PiCrownSimpleFill } from 'react-icons/pi';
import { getRankingFn } from '../api/trackerApi';
import { useState } from 'react';
import { filterTypes } from '../types';
import { Link } from 'react-router-dom';

function RankingScreen() {
  const [limit] = useState(10);
  const [xpFilter, setXpFilter] = useState<filterTypes>('userXp');
  const [timeFilter, setTimeFilter] = useState<string>('all-time');

  const {
    data: rankedUsers,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['ranking', xpFilter, timeFilter],
    queryFn: ({ pageParam }) =>
      getRankingFn({
        limit,
        page: pageParam as number,
        filter: xpFilter,
        timeFilter,
      }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < limit) return undefined;
      return lastPageParam + 1;
    },
    initialPageParam: 1,
    staleTime: Infinity,
  });

  // Filter options for the dropdown
  const filterOptions = [
    { label: 'Total XP', value: 'userXp', icon: '⚡' },
    { label: 'Reading XP', value: 'readingXp', icon: '📚' },
    { label: 'Listening XP', value: 'listeningXp', icon: '🎧' },
  ];

  // Time filter options
  const timeFilterOptions = [
    { label: 'All Time', value: 'all-time', icon: '🏆' },
    { label: 'Today', value: 'today', icon: '📅' },
    { label: 'This Month', value: 'month', icon: '📊' },
    { label: 'This Year', value: 'year', icon: '🗓️' },
  ];

  // Get the correct label for the selected filter
  const getFilterLabel = () => {
    const option = filterOptions.find((option) => option.value === xpFilter);
    return option?.label || 'XP';
  };

  const getFilterIcon = () => {
    const option = filterOptions.find((option) => option.value === xpFilter);
    return option?.icon || '⚡';
  };

  // Get the correct label for the selected time filter
  const getTimeFilterLabel = () => {
    const option = timeFilterOptions.find(
      (option) => option.value === timeFilter
    );
    return option?.label || 'All Time';
  };

  const getTimeFilterIcon = () => {
    const option = timeFilterOptions.find(
      (option) => option.value === timeFilter
    );
    return option?.icon || '🏆';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-warning';
      case 2:
        return 'text-base-content';
      case 3:
        return 'text-accent';
      default:
        return 'text-base-content/70';
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-2">
            🏆 Leaderboard
          </h1>
          <p className="text-base-content/70">
            See how you stack up against other learners
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          {/* Time filter dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-outline gap-2">
              <span className="text-lg">{getTimeFilterIcon()}</span>
              {getTimeFilterLabel()}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300"
            >
              {timeFilterOptions.map((option) => (
                <li key={option.value}>
                  <button
                    className={`gap-3 ${timeFilter === option.value ? 'active' : ''}`}
                    onClick={() => setTimeFilter(option.value)}
                  >
                    <span className="text-lg">{option.icon}</span>
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Filter dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-primary gap-2">
              <span className="text-lg">{getFilterIcon()}</span>
              {getFilterLabel()}
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300"
            >
              {filterOptions.map((option) => (
                <li key={option.value}>
                  <button
                    className={`gap-3 ${xpFilter === option.value ? 'active' : ''}`}
                    onClick={() => setXpFilter(option.value as filterTypes)}
                  >
                    <span className="text-lg">{option.icon}</span>
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="mt-4 text-base-content/70">Loading rankings...</p>
            </div>
          </div>
        ) : (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-0">
              {/* Top 3 Podium */}
              {rankedUsers?.pages[0] && rankedUsers.pages[0].length >= 3 && (
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 rounded-t-md">
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    {/* 2nd Place */}
                    <div className="text-center order-1">
                      <div className="relative mb-4">
                        <div className="avatar">
                          <div className="w-16 h-16 rounded-full ring ring-base-content/20">
                            {rankedUsers.pages[0][1]?.avatar ? (
                              <img
                                src={rankedUsers.pages[0][1].avatar}
                                alt={`${rankedUsers.pages[0][1].username}'s Avatar`}
                              />
                            ) : (
                              <div className="bg-neutral-content flex items-center justify-center h-full">
                                <span className="text-xl font-bold">
                                  {rankedUsers.pages[0][1]?.username
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/user/${rankedUsers.pages[0][1]?.username}`}
                        className="font-bold hover:underline block"
                      >
                        🥈 {rankedUsers.pages[0][1]?.username}
                      </Link>
                      <div className="text-sm text-base-content/70">
                        Lv.{rankedUsers.pages[0][1]?.stats?.userLevel ?? 1}
                      </div>
                      <div className="text-lg font-bold text-base-content mt-1">
                        {(xpFilter === 'userXp'
                          ? rankedUsers.pages[0][1]?.stats?.userXp
                          : xpFilter === 'readingXp'
                            ? rankedUsers.pages[0][1]?.stats?.readingXp
                            : rankedUsers.pages[0][1]?.stats?.listeningXp
                        )?.toLocaleString() ?? 0}
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center order-2">
                      <div className="relative mb-4">
                        <div className="avatar">
                          <div className="w-20 h-20 rounded-full ring ring-warning ring-offset-2">
                            {rankedUsers.pages[0][0]?.avatar ? (
                              <img
                                src={rankedUsers.pages[0][0].avatar}
                                alt={`${rankedUsers.pages[0][0].username}'s Avatar`}
                              />
                            ) : (
                              <div className="bg-neutral-content flex items-center justify-center h-full">
                                <span className="text-2xl font-bold">
                                  {rankedUsers.pages[0][0]?.username
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                          <PiCrownSimpleFill className="text-4xl text-warning" />
                        </div>
                      </div>
                      <Link
                        to={`/user/${rankedUsers.pages[0][0]?.username}`}
                        className="font-bold hover:underline block text-lg"
                      >
                        {rankedUsers.pages[0][0]?.username}
                      </Link>
                      <div className="text-sm text-base-content/70">
                        Lv.{rankedUsers.pages[0][0]?.stats?.userLevel ?? 1}
                      </div>
                      <div className="text-xl font-bold text-warning mt-1">
                        {(xpFilter === 'userXp'
                          ? rankedUsers.pages[0][0]?.stats?.userXp
                          : xpFilter === 'readingXp'
                            ? rankedUsers.pages[0][0]?.stats?.readingXp
                            : rankedUsers.pages[0][0]?.stats?.listeningXp
                        )?.toLocaleString() ?? 0}
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center order-3">
                      <div className="relative mb-4">
                        <div className="avatar">
                          <div className="w-16 h-16 rounded-full ring ring-base-content/20">
                            {rankedUsers.pages[0][2]?.avatar ? (
                              <img
                                src={rankedUsers.pages[0][2].avatar}
                                alt={`${rankedUsers.pages[0][2].username}'s Avatar`}
                              />
                            ) : (
                              <div className="bg-neutral-content flex items-center justify-center h-full">
                                <span className="text-xl font-bold">
                                  {rankedUsers.pages[0][2]?.username
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/user/${rankedUsers.pages[0][2]?.username}`}
                        className="font-bold hover:underline block"
                      >
                        🥉 {rankedUsers.pages[0][2]?.username}
                      </Link>
                      <div className="text-sm text-base-content/70">
                        Lv.{rankedUsers.pages[0][2]?.stats?.userLevel ?? 1}
                      </div>
                      <div className="text-lg font-bold text-base-content mt-1">
                        {(xpFilter === 'userXp'
                          ? rankedUsers.pages[0][2]?.stats?.userXp
                          : xpFilter === 'readingXp'
                            ? rankedUsers.pages[0][2]?.stats?.readingXp
                            : rankedUsers.pages[0][2]?.stats?.listeningXp
                        )?.toLocaleString() ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rankings List */}
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="border-b border-base-300">
                      <th className="text-center w-16">Rank</th>
                      <th>User</th>
                      <th className="text-center">Level</th>
                      <th className="text-end">{getFilterLabel()}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedUsers?.pages.map((group, groupIndex) =>
                      group.map((user, index) => {
                        const rank = groupIndex * limit + index + 1;
                        const xpValue =
                          xpFilter === 'userXp'
                            ? user.stats?.userXp
                            : xpFilter === 'readingXp'
                              ? user.stats?.readingXp
                              : user.stats?.listeningXp;

                        // Skip top 3 in the table if they're already shown in podium
                        if (rank <= 3 && rankedUsers.pages[0].length >= 3)
                          return null;

                        return (
                          <tr
                            key={`${user.username}-${rank}`}
                            className="hover:bg-base-200/50 transition-colors"
                          >
                            <td className="text-center">
                              <div
                                className={`flex items-center justify-center gap-2 ${getRankColor(rank)}`}
                              >
                                {getRankIcon(rank) && (
                                  <span className="text-xl">
                                    {getRankIcon(rank)}
                                  </span>
                                )}
                                <span className="font-bold text-lg">
                                  {rank}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="avatar">
                                  <div className="w-12 h-12 rounded-full ring ring-base-content/10">
                                    {user.avatar ? (
                                      <img
                                        src={user.avatar}
                                        alt={`${user.username}'s Avatar`}
                                      />
                                    ) : (
                                      <div className="bg-neutral-content flex items-center justify-center h-full">
                                        <span className="text-lg font-bold">
                                          {user.username
                                            .charAt(0)
                                            .toUpperCase()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Link
                                    to={`/user/${user.username}`}
                                    className="font-bold hover:text-primary transition-colors"
                                    title={`View ${user.username}'s profile`}
                                  >
                                    {user.username}
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="badge badge-outline">
                                Lv.{user.stats?.userLevel ?? 1}
                              </div>
                            </td>
                            <td className="text-end">
                              <div className="font-bold text-lg">
                                {xpValue?.toLocaleString() ?? 0}
                              </div>
                              <div className="text-xs text-base-content/60">
                                XP
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {hasNextPage && (
                <div className="p-6 text-center border-t border-base-300">
                  <button
                    className="btn btn-primary btn-wide"
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Loading more...
                      </>
                    ) : (
                      'Load More Rankings'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RankingScreen;
