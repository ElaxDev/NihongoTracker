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
  const accent = 'primary';

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
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: Infinity,
    enabled: !!username,
  });

  const totalUserXpToLevelUp = user?.stats.userXpToNextLevel
    ? user?.stats.userXpToNextLevel - user?.stats.userXpToCurrentLevel
    : 0;
  const userProgressXP = user?.stats.userXp
    ? user?.stats.userXp - user?.stats.userXpToCurrentLevel
    : 0;
  const userProgressPercentage = (userProgressXP / totalUserXpToLevelUp) * 100;

  const totalListeningXpToLevelUp = user?.stats.listeningXpToNextLevel
    ? user?.stats.listeningXpToNextLevel - user?.stats.listeningXpToCurrentLevel
    : 0;
  const listeningProgressXP = user?.stats.listeningXp
    ? user?.stats.listeningXp - user?.stats.listeningXpToCurrentLevel
    : 0;
  const listeningProgressPercentage =
    (listeningProgressXP / totalListeningXpToLevelUp) * 100;

  const totalReadingXpToLevelUp = user?.stats.readingXpToNextLevel
    ? user?.stats.readingXpToNextLevel - user?.stats.readingXpToCurrentLevel
    : 0;
  const readingProgressXP = user?.stats.readingXp
    ? user?.stats.readingXp - user?.stats.readingXpToCurrentLevel
    : 0;
  const readingProgressPercentage =
    (readingProgressXP / totalReadingXpToLevelUp) * 100;
  return (
    <div className="flex flex-col items-center py-8">
      <div className="2xl:max-w-(--breakpoint-2xl) min-w-[50%] px-0">
        <div className="grid grid-cols-2 gap-10">
          <div className="flex flex-col shrink gap-5">
            <div className="card w-full bg-base-100">
              <div className="card-body w-full">
                <p>User Progress</p>
                <ProgressBar
                  progress={userProgressPercentage}
                  maxProgress={100}
                  progressColor={accent}
                />
                <div className="flex justify-between text-sm">
                  <p>Level: {user?.stats.userLevel}</p>
                  <p className="text-right">
                    XP: {userProgressXP}/{totalUserXpToLevelUp}
                  </p>
                </div>

                <p>Listening Progress</p>
                <ProgressBar
                  progress={listeningProgressPercentage}
                  maxProgress={100}
                  progressColor={`primary`}
                />
                <div className="flex justify-between text-sm">
                  <p>Level: {user?.stats.listeningLevel}</p>
                  <p className="text-right">
                    XP: {listeningProgressXP}/{totalListeningXpToLevelUp}
                  </p>
                </div>

                <p>Reading Progress</p>
                <ProgressBar
                  progress={readingProgressPercentage}
                  maxProgress={100}
                  progressColor={accent}
                />
                <div className="flex justify-between text-sm">
                  <p>Level: {user?.stats.readingLevel}</p>
                  <p className="text-right">
                    XP: {readingProgressXP}/{totalReadingXpToLevelUp}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 items-center">
            {logs && logs?.pages ? (
              logs.pages.map((page, index) => (
                <React.Fragment key={index}>
                  {page.map((log) => (
                    <LogCard key={log._id} log={log} />
                  ))}
                </React.Fragment>
              ))
            ) : (
              <p>No logs available</p>
            )}
            <button
              className="btn btn-wide bg-base-100"
              onClick={() => fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
            >
              {isFetchingNextPage
                ? 'Loading more...'
                : hasNextPage
                  ? 'Load More'
                  : 'Nothing more to load'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;
