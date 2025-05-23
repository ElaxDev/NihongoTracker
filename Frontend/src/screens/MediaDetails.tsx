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
      <div className="w-full grid grid-cols-[208px_auto] gap-10 my-7 px-12 lg:max-w-6xl lg:px-12 2xl:px-24 mx-auto">
        <div className="card bg-base-100 p-6 w-full h-full flex flex-col gap-4">
          <p className="font-bold text-xl">Media Details</p>

          <div>
            <p className="capitalize font-bold">Type</p>
            <p className="uppercase">{mediaType}</p>
          </div>
          <div>
            <p className="capitalize font-bold">Links</p>
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
                <p className="capitalize font-bold">Episodes</p>
                <p>{mediaDocument?.episodes}</p>
              </div>
              <div>
                <p className="capitalize font-bold">Episode Duration</p>
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
                <p className="capitalize font-bold">Volumes</p>
                <p>{mediaDocument?.volumes}</p>
              </div>
              <div>
                <p className="capitalize font-bold">Chapters</p>
                <p>{mediaDocument?.chapters}</p>
              </div>
            </>
          )}
        </div>
        <div className="card bg-base-100 p-6 w-full h-full flex flex-col gap-4">
          <p className="font-bold text-xl">Media Details</p>
          <ProgressChart logs={logs} />
        </div>
        <div className="card bg-base-100 p-6 w-full h-full flex flex-col gap-4">
          <p className="font-bold text-xl">Immersion Overview</p>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="font-bold">Total XP</p>
              <p>{totalXp}</p>
            </div>
            {totalTime && totalTime > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="font-bold">Total Time</p>
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
                <p className="font-bold">Total Episodes Watched</p>
                <p>
                  {logs?.reduce((acc, log) => acc + (log.episodes ?? 0), 0)}
                </p>
              </div>
            )}
            {mediaDocument?.type === 'manga' && (
              <div className="flex flex-col gap-2">
                <p className="font-bold">Total Pages Read</p>
                <p>{logs?.reduce((acc, log) => acc + (log.pages ?? 0), 0)}</p>
              </div>
            )}
            {(mediaDocument?.type === 'vn' ||
              mediaDocument?.type === 'manga' ||
              mediaDocument?.type === 'reading') && (
              <div className="flex flex-col gap-2">
                <p className="font-bold">Total Characters Read</p>
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
  );
}

export default MediaDetails;
