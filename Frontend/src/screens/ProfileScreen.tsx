import { useParams } from 'react-router-dom';
import LogCard from '../components/LogCard';
import ProgressBar from '../components/ProgressBar';
import { useState } from 'react';
import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserLogsFn } from '../api/authApi';
import { useProfileDataStore } from '../store/profileData';

function ProfileScreen() {
  const [limit] = useState(10);
  const { username } = useParams<{ username: string }>();
  const { user } = useProfileDataStore();

  const {
    data: logs,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['logs', username],
    queryFn: ({ pageParam }) =>
      getUserLogsFn(username as string, { limit, page: pageParam as number }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < limit) return undefined;
      return lastPageParam + 1;
    },
    initialPageParam: 1,
    staleTime: Infinity,
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
    <div className="flex flex-col items-center">
      <div className="2xl:max-w-screen-2xl 2xl:min-w-[50%] min-w-full">
        <div className="grid grid-cols-2 gap-10">
          <div className="flex flex-col gap-5 pt-5">
            <div className="card w-96 bg-base-100 shadow-xl">
              <div className="card-body w-full">
                <p>User Progress</p>
                <ProgressBar
                  progress={userProgressPercentage}
                  maxProgress={100}
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

          <div className="flex flex-col gap-5 py-5 items-center">
            {logs?.pages.map((group, i) => (
              <React.Fragment key={i}>
                {group.map((log) => (
                  <LogCard key={log._id} log={log} />
                ))}
              </React.Fragment>
            ))}
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
