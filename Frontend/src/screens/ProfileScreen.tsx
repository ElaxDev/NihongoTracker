import { useOutletContext } from 'react-router-dom';
import LogCard from '../components/LogCard';
import ProgressBar from '../components/ProgressBar';
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserLogsFn } from '../api/trackerApi';
import { OutletProfileContextType } from '../types';

function ProfileScreen() {
  const limit = 10;
  const { user, username } = useOutletContext<OutletProfileContextType>();

  const {
    data: logs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['logs', username],
    queryFn: ({ pageParam }) =>
      getUserLogsFn(username as string, { limit, page: pageParam as number }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < limit) return undefined;
      return allPages ? allPages.length + 1 : 2;
    },
    initialPageParam: 1,
    staleTime: Infinity,
    enabled: !!username,
  });

  const totalUserXpToLevelUp = user?.stats?.userXpToNextLevel
    ? user?.stats?.userXpToNextLevel - user?.stats?.userXpToCurrentLevel
    : 0;
  const userProgressXP = user?.stats?.userXp
    ? user?.stats?.userXp - user?.stats?.userXpToCurrentLevel
    : 0;
  const userProgressPercentage = (userProgressXP / totalUserXpToLevelUp) * 100;

  const totalListeningXpToLevelUp = user?.stats?.listeningXpToNextLevel
    ? user?.stats?.listeningXpToNextLevel -
      user?.stats?.listeningXpToCurrentLevel
    : 0;
  const listeningProgressXP = user?.stats?.listeningXp
    ? user?.stats?.listeningXp - user?.stats?.listeningXpToCurrentLevel
    : 0;
  const listeningProgressPercentage =
    (listeningProgressXP / totalListeningXpToLevelUp) * 100;

  const totalReadingXpToLevelUp = user?.stats?.readingXpToNextLevel
    ? user?.stats?.readingXpToNextLevel - user?.stats?.readingXpToCurrentLevel
    : 0;
  const readingProgressXP = user?.stats?.readingXp
    ? user?.stats?.readingXp - user?.stats?.readingXpToCurrentLevel
    : 0;
  const readingProgressPercentage =
    (readingProgressXP / totalReadingXpToLevelUp) * 100;
  return (
    <div className="flex flex-col items-center py-4 sm:py-8 px-4 sm:px-6">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
          <div className="flex flex-col shrink gap-4 md:gap-5">
            <div className="card w-full bg-base-100 shadow-sm">
              <div className="card-body w-full p-4 sm:p-6">
                <h2 className="card-title mb-2">Progress Stats</h2>

                <p className="mt-2">User Progress</p>
                <ProgressBar
                  progress={userProgressPercentage}
                  maxProgress={100}
                />
                <div className="flex justify-between text-sm">
                  <p>Level: {user?.stats?.userLevel}</p>
                  <p className="text-right">
                    XP: {userProgressXP}/{totalUserXpToLevelUp}
                  </p>
                </div>

                <p className="mt-3">Listening Progress</p>
                <ProgressBar
                  progress={listeningProgressPercentage}
                  maxProgress={100}
                />
                <div className="flex justify-between text-sm">
                  <p>Level: {user?.stats?.listeningLevel}</p>
                  <p className="text-right">
                    XP: {listeningProgressXP}/{totalListeningXpToLevelUp}
                  </p>
                </div>

                <p className="mt-3">Reading Progress</p>
                <ProgressBar
                  progress={readingProgressPercentage}
                  maxProgress={100}
                />
                <div className="flex justify-between text-sm">
                  <p>Level: {user?.stats?.readingLevel}</p>
                  <p className="text-right">
                    XP: {readingProgressXP}/{totalReadingXpToLevelUp}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:gap-5">
            <h2 className="card-title self-start mb-2">Activity Logs</h2>
            {logs?.pages ? (
              logs.pages.map((page, index) => (
                <React.Fragment key={index}>
                  {Array.isArray(page)
                    ? page.map((log) => (
                        <LogCard key={log._id} log={log} user={username} />
                      ))
                    : null}
                </React.Fragment>
              ))
            ) : (
              <div className="card w-full bg-base-100 shadow-sm p-4">
                <p className="text-center">No logs available</p>
              </div>
            )}
            <button
              className="btn btn-primary w-full sm:btn-wide mt-2 self-center"
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : hasNextPage ? (
                'Load More'
              ) : (
                'Nothing more to load'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;
