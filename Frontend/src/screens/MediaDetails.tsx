import { useOutletContext } from 'react-router-dom';
import { OutletMediaContextType } from '../types';
import ProgressChart from '../components/ProgressChart';
import { useQuery } from '@tanstack/react-query';
import { getUserLogsFn } from '../api/trackerApi';
import { numberWithCommas } from '../utils/utils';
import LogCard from '../components/LogCard';
import { useState } from 'react';

function MediaDetails() {
  const { mediaDocument, mediaType, username } =
    useOutletContext<OutletMediaContextType>();

  const [visibleLogsCount, setVisibleLogsCount] = useState(10);

  const { data: logs } = useQuery({
    queryKey: [username, 'logs', 'total', mediaDocument?.contentId],
    queryFn: () =>
      getUserLogsFn(username ?? '', {
        mediaId: mediaDocument?.contentId,
        type: mediaDocument?.type,
        limit: 0,
        page: 1,
      }),
    staleTime: Infinity,
  });

  const totalXp = logs?.reduce((acc, log) => acc + log.xp, 0);
  const totalTime = logs?.reduce((acc, log) => acc + (log.time ?? 0), 0);

  // Sort logs by date (most recent first)
  const sortedLogs = logs
    ? [...logs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  const visibleLogs = sortedLogs.slice(0, visibleLogsCount);
  const hasMoreLogs = sortedLogs.length > visibleLogsCount;

  const handleShowMore = () => {
    setVisibleLogsCount((prev) => Math.min(prev + 10, sortedLogs.length));
  };

  return (
    <div>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 my-4 sm:my-7 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-4 md:gap-6 lg:gap-8">
          {/* Left Column - Media Details + User Overview */}
          <div className="space-y-6">
            {/* Media Details Card */}
            <div className="card bg-base-100 shadow-sm p-4 sm:p-6 w-full flex flex-col gap-3 md:gap-4">
              <p className="font-bold text-lg sm:text-xl">Media Details</p>

              <div>
                <p className="capitalize font-bold text-sm sm:text-base">
                  Type
                </p>
                <p className="uppercase">{mediaType}</p>
              </div>
              <div>
                <p className="capitalize font-bold text-sm sm:text-base">
                  Links
                </p>
                {mediaDocument?.type === 'anime' ||
                mediaDocument?.type === 'manga' ||
                mediaDocument?.type === 'reading' ? (
                  <a
                    className="link"
                    href={`https://anilist.co/${mediaDocument?.type === 'anime' ? 'anime' : mediaDocument?.type === 'manga' || mediaDocument?.type === 'reading' ? 'manga' : ''}/${mediaDocument?.contentId}`}
                  >
                    Anilist
                  </a>
                ) : null}
                {mediaDocument?.type === 'vn' ? (
                  <a
                    className="link"
                    href={`https://vndb.org/${mediaDocument?.type === 'vn' ? mediaDocument?.contentId : ''}`}
                  >
                    VNDB
                  </a>
                ) : null}
                {mediaDocument?.type === 'video' ? (
                  <a
                    className="link"
                    href={`https://www.youtube.com/channel/${mediaDocument?.contentId}`}
                  >
                    YouTube Channel
                  </a>
                ) : null}
              </div>
              {mediaType === 'anime' && (
                <>
                  <div>
                    <p className="capitalize font-bold text-sm sm:text-base">
                      Episodes
                    </p>
                    <p>{mediaDocument?.episodes}</p>
                  </div>
                  <div>
                    <p className="capitalize font-bold text-sm sm:text-base">
                      Episode Duration
                    </p>
                    <p>
                      {mediaDocument?.episodeDuration &&
                      mediaDocument.episodeDuration >= 60
                        ? `${Math.floor(mediaDocument.episodeDuration / 60)} hour `
                        : ''}
                      {mediaDocument?.episodeDuration &&
                      mediaDocument.episodeDuration % 60 > 0
                        ? `${mediaDocument.episodeDuration % 60} mins`
                        : ''}
                    </p>
                  </div>
                </>
              )}
              {mediaType === 'manga' && (
                <>
                  <div>
                    <p className="capitalize font-bold text-sm sm:text-base">
                      Volumes
                    </p>
                    <p>{mediaDocument?.volumes}</p>
                  </div>
                  <div>
                    <p className="capitalize font-bold text-sm sm:text-base">
                      Chapters
                    </p>
                    <p>{mediaDocument?.chapters}</p>
                  </div>
                </>
              )}
            </div>

            {/* User Overview Card */}
            <div className="card bg-base-100 shadow-sm p-4 sm:p-6 w-full flex flex-col gap-3 md:gap-4">
              <p className="font-bold text-lg sm:text-xl capitalize">
                {username}'s Overview
              </p>
              <div className="flex flex-col gap-2">
                <p className="font-bold">Total XP</p>
                <p>{totalXp}</p>
              </div>
              {totalTime && totalTime > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-sm sm:text-base">Total Time</p>
                  <p>
                    {totalTime && totalTime >= 60
                      ? `${Math.floor(totalTime / 60)} hour `
                      : ''}
                    {totalTime && totalTime % 60 > 0
                      ? `${totalTime % 60} mins`
                      : ''}
                  </p>
                </div>
              ) : null}
              {mediaDocument?.type === 'anime' && (
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-sm sm:text-base">
                    Total Episodes Watched
                  </p>
                  <p>
                    {logs?.reduce((acc, log) => acc + (log.episodes ?? 0), 0)}
                  </p>
                </div>
              )}
              {mediaDocument?.type === 'manga' && (
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-sm sm:text-base">
                    Total Pages Read
                  </p>
                  <p>{logs?.reduce((acc, log) => acc + (log.pages ?? 0), 0)}</p>
                </div>
              )}
              {(mediaDocument?.type === 'vn' ||
                mediaDocument?.type === 'manga' ||
                mediaDocument?.type === 'reading') && (
                <div className="flex flex-col gap-2">
                  <p className="font-bold text-sm sm:text-base">
                    Total Characters Read
                  </p>
                  <p>
                    {numberWithCommas(
                      logs?.reduce((acc, log) => acc + (log.chars ?? 0), 0)
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Progress Chart + Logs */}
          <div className="space-y-6">
            {/* Progress Chart Card */}
            <div className="card bg-base-100 shadow-sm p-4 sm:p-6 w-full flex flex-col gap-3 md:gap-4">
              <p className="font-bold text-lg sm:text-xl">Progress Chart</p>
              <ProgressChart logs={logs} />
            </div>

            {/* Logs Section */}
            <div className="card bg-base-100 shadow-sm p-4 sm:p-6 w-full">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold">Recent Activity</h2>
              </div>

              {logs && logs.length > 0 ? (
                <div className="space-y-3">
                  {visibleLogs.map((log) => (
                    <LogCard key={log._id} log={log} />
                  ))}
                  {hasMoreLogs && (
                    <div className="text-center pt-4">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={handleShowMore}
                      >
                        Show More ({sortedLogs.length - visibleLogsCount}{' '}
                        remaining)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-base-content/50 mb-4">
                    <svg
                      className="w-12 h-12 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-base-content/70 mb-1">
                    No logs found
                  </h3>
                  <p className="text-sm text-base-content/50">
                    No activity logged yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaDetails;
