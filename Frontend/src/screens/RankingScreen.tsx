import { useInfiniteQuery } from '@tanstack/react-query';
import { getRankingFn } from '../api/trackerApi';
import { useState } from 'react';

function RankingScreen() {
  const [limit] = useState(10);

  const {
    data: rankedUsers,
    // fetchNextPage,
    // hasNextPage,
    // isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['ranking'],
    queryFn: ({ pageParam }) =>
      getRankingFn({ limit, page: pageParam as number }),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.length < limit) return undefined;
      return lastPageParam + 1;
    },
    initialPageParam: 1,
    staleTime: Infinity,
  });

  return (
    <div className="pt-32 py-16 flex justify-center items-center bg-base-300 min-h-screen">
      <div className="card min-w-96 bg-base-100">
        <div className="card-body w-full">
          <h2 className="card-title font-bold text-2xl">Ranking</h2>
          <div className="overflow-x-auto">
            <table className="table table-lg w-full">
              <thead>
                <tr className="font-bold text-base">
                  <th>Rank</th>
                  <th>Username</th>
                  <th>XP</th>
                </tr>
              </thead>
              <tbody>
                {rankedUsers?.pages.map((group) =>
                  group.map((user, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        {' '}
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="mask mask-circle h-12 w-12">
                              {user.avatar ? (
                                <img src={user.avatar} alt="User Avatar" />
                              ) : null}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="font-bold">{user.username}</div>
                            <div>Lv.{user.stats?.userLevel ?? 1}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.stats?.userXp ?? 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RankingScreen;
