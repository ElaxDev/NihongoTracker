import { useMutation } from '@tanstack/react-query';
import { ILog } from '../types';
import { DateTime } from 'luxon';
import { MdDelete } from 'react-icons/md';
import { deleteLogFn } from '../api/trackerApi';
import { toast } from 'react-toastify';
import queryClient from '../queryClient';
import { AxiosError } from 'axios';
import { useUserDataStore } from '../store/userData';
import { useRef } from 'react';

const logTypeText = {
  reading: 'Reading',
  anime: 'Anime',
  vn: 'Visual Novel',
  video: 'Video',
  manga: 'Manga',
  audio: 'Audio',
  other: 'Other',
};

function LogCard({ log, user: logUser }: { log: ILog; user?: string }) {
  const { description, xp, date, type, episodes, pages, time, chars, media } =
    log;
  const { user } = useUserDataStore();
  const deleteModalRef = useRef<HTMLDialogElement>(null);

  const relativeDate = date
    ? typeof date === 'string'
      ? DateTime.fromISO(date).toRelative()
      : DateTime.fromJSDate(date as Date).toRelative()
    : '';

  const logTitle =
    media && typeof media === 'object' && media.title?.contentTitleNative
      ? media.title.contentTitleNative.length > 30
        ? `${media.title.contentTitleNative.slice(0, 30)}...`
        : media.title.contentTitleNative
      : description
        ? description.length > 30
          ? `${description.slice(0, 30)}...`
          : description
        : '';

  const { mutate: deleteLog, isPending: loadingDeleteLog } = useMutation({
    mutationFn: (id: string) => deleteLogFn(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        predicate: (query) =>
          ['logs', 'user'].includes(query.queryKey[0] as string),
      });
      toast.success('Log deleted successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data.message
          : 'An error occurred';
      toast.error(errorMessage);
    },
  });

  function renderQuantity() {
    if (type === 'anime') {
      return <p>Episodes: {episodes}</p>;
    } else if (type === 'manga') {
      if (chars) {
        return (
          <>
            <p>Pages: {pages}</p>
            <p>Character count: {chars}</p>
          </>
        );
      } else {
        return <p>Pages: {pages}</p>;
      }
    } else if (type === 'vn' || type === 'reading') {
      if (chars) {
        return <p>Character count: {chars}</p>;
      } else if (time) {
        return <p>Time: {time > 60 ? `${time / 60}h` : `${time}m`}</p>;
      }
    } else if ((type === 'video' || type === 'audio') && time) {
      return (
        <p>
          {time
            ? time >= 60
              ? `Time: ${time / 60}h`
              : `Time: ${time}m`
            : null}
        </p>
      );
    } else {
      return null;
    }
  }

  return (
    <div className="card card-side h-full w-full min-h-8 max-w-[450px] bg-base-100 text-base-content">
      <div className="card-body w-full">
        <div className="flex items-center justify-between">
          <h2 className="card-title tooltip" data-tip={description}>
            {logTitle}
          </h2>
          {logUser === user?.username ? (
            <button
              className="btn btn-sm btn-circle btn-ghost group"
              onClick={() => deleteModalRef.current?.showModal()}
            >
              <MdDelete className="text-xl opacity-75 group-hover:opacity-100" />
            </button>
          ) : null}
        </div>
        <p>Type: {logTypeText[type]}</p>
        {renderQuantity()}
        <div className="flex justify-between w-full">
          <p>XP: {xp}</p>
          <p className="text-right">{relativeDate}</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <dialog
        id={`delete-modal-${log._id}`}
        className="modal modal-bottom sm:modal-middle"
        ref={deleteModalRef}
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Confirm Deletion</h3>
          <div className="divider"></div>
          <p className="py-4">
            Are you sure you want to delete this log? This action cannot be
            undone.
          </p>
          <div className="modal-action">
            <button
              onClick={() => deleteLog(log._id)}
              className="btn btn-error"
              disabled={loadingDeleteLog}
            >
              {loadingDeleteLog ? 'Deleting...' : 'Delete Log'}
            </button>
            <form method="dialog">
              <button className="btn btn-outline">Cancel</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}

export default LogCard;
