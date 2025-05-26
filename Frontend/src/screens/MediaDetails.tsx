import { useOutletContext } from 'react-router-dom';
import { OutletMediaContextType } from '../types';
import { useUserDataStore } from '../store/userData';
import ProgressChart from '../components/ProgressChart';
import { useQuery } from '@tanstack/react-query';
import { getUserLogsFn } from '../api/trackerApi';
import { numberWithCommas } from '../utils/utils';

function MediaDetails() {
  const { mediaDocument, mediaType } =
    useOutletContext<OutletMediaContextType>();
  const { user } = useUserDataStore();

  const { data: logs } = useQuery({
    queryKey: [user?.username, 'logs', 'total', mediaDocument?.contentId],
    queryFn: () =>
      getUserLogsFn(user?.username ?? '', {
        mediaId: mediaDocument?.contentId,
        mediaType: mediaDocument?.type,
        limit: 0,
        page: 1,
      }),
    staleTime: Infinity,
  });

  const totalXp = logs?.reduce((acc, log) => acc + log.xp, 0);
  const totalTime = logs?.reduce((acc, log) => acc + (log.time ?? 0), 0);

  return (
    <div>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 my-4 sm:my-7 mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[250px_1fr] gap-4 md:gap-6 lg:gap-8">
          {/* Media Details Card */}
          <div className="card bg-base-100 shadow-sm p-4 sm:p-6 w-full h-full flex flex-col gap-3 md:gap-4">
            <p className="font-bold text-lg sm:text-xl">Media Details</p>

            <div>
              <p className="capitalize font-bold text-sm sm:text-base">Type</p>
              <p className="uppercase">{mediaType}</p>
            </div>
            <div>
              <p className="capitalize font-bold text-sm sm:text-base">Links</p>
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

          {/* Progress Chart Card */}
          <div className="card bg-base-100 shadow-sm p-4 sm:p-6 w-full h-full flex flex-col gap-3 md:gap-4">
            <p className="font-bold text-lg sm:text-xl">Media Details</p>
            <ProgressChart logs={logs} />
          </div>

          {/* Immersion Overview Card - Full width on mobile */}
          <div className="card bg-base-100 shadow-sm p-4 sm:p-6 w-full h-full flex flex-col gap-3 md:gap-4 md:col-span-2 lg:col-span-2">
            <p className="font-bold text-lg sm:text-xl">Immersion Overview</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <p className="font-bold text-sm sm:text-base">Total XP</p>
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
        </div>
      </div>
    </div>
  );
}

export default MediaDetails;
