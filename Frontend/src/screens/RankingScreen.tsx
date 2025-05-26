import { useInfiniteQuery } from '@tanstack/react-query';
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
    { label: 'Total XP', value: 'userXp' },
    { label: 'Reading XP', value: 'readingXp' },
    { label: 'Listening XP', value: 'listeningXp' },
  ];

  // Time filter options
  const timeFilterOptions = [
    { label: 'All Time', value: 'all-time' },
    { label: 'Today', value: 'today' },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
  ];

  // Get the correct label for the selected filter
  const getFilterLabel = () => {
    return (
      filterOptions.find((option) => option.value === xpFilter)?.label || 'XP'
    );
  };

  // Get the correct label for the selected time filter
  const getTimeFilterLabel = () => {
    return (
      timeFilterOptions.find((option) => option.value === timeFilter)?.label ||
      'All Time'
    );
  };

  return (
    <div className="py-16 flex justify-center items-center bg-base-200 min-h-screen">
      <div className="card w-full max-w-3xl bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title font-bold text-2xl">Leaderboard</h2>

            <div className="flex gap-2">
              {/* Time filter dropdown */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-primary">
                  Time: {getTimeFilterLabel()} <span className="ml-1">▼</span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  {timeFilterOptions.map((option) => (
                    <li key={option.value}>
                      <button
                        className={timeFilter === option.value ? 'active' : ''}
                        onClick={() => setTimeFilter(option.value)}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Filter dropdown */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-primary">
                  Filter by: {getFilterLabel()} <span className="ml-1">▼</span>
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  {filterOptions.map((option) => (
                    <li key={option.value}>
                      <button
                        className={xpFilter === option.value ? 'active' : ''}
                        onClick={() => setXpFilter(option.value as filterTypes)}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-200">
                      <th className="text-center">#</th>
                      <th>User</th>
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

                        return (
                          <tr
                            key={`${user.username}-${rank}`}
                            className={rank <= 3 ? 'font-medium' : ''}
                          >
                            <td className="text-center">
                              {rank <= 3 ? (
                                <div
                                  className={`badge badge-lg ${
                                    rank === 1
                                      ? 'badge-warning'
                                      : rank === 2
                                        ? 'badge-secondary'
                                        : 'badge-accent'
                                  }`}
                                >
                                  {rank}
                                </div>
                              ) : (
                                rank
                              )}
                            </td>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="avatar">
                                  <div className="mask mask-circle h-10 w-10">
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
                                    className="font-bold hover:underline"
                                    title={`View ${user.username}'s profile`}
                                  >
                                    {user.username}
                                  </Link>
                                  <div className="text-sm opacity-70">
                                    Lv.{user.stats?.userLevel ?? 1}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-end font-semibold">
                              {xpValue?.toLocaleString() ?? 0}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {hasNextPage && (
                <div className="card-actions justify-center mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Loading more...
                      </>
                    ) : hasNextPage ? (
                      'Load More'
                    ) : (
                      'No more data'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RankingScreen;
