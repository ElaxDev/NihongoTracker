// import { Link } from 'react-router-dom';
import { ILog } from '../types';
import { DateTime } from 'luxon';

const logTypeText = {
  reading: 'Reading',
  anime: 'Anime',
  vn: 'Visual Novel',
  video: 'Video',
  manga: 'Manga',
  audio: 'Audio',
  other: 'Other',
};

function LogCard({ log }: { log: ILog }) {
  const {
    description,
    mediaName,
    xp,
    date,
    type,
    episodes,
    pages,
    time,
    chars,
  } = log;
  const relativeDate = date ? DateTime.fromISO(date).toRelative() : date;

  const logTitle = mediaName
    ? `${mediaName}${description ? ` (${description})` : ''}`
    : description || '';

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
    <div className="card card-side h-full w-full min-h-8 bg-base-100 text-base-content">
      <div className="card-body w-full">
        <h2 className="card-title">{logTitle}</h2>
        <p>Type: {logTypeText[type]}</p>
        {renderQuantity()}
        <div className="flex justify-between w-full">
          <p>XP: {xp}</p>
          <p className="text-right">{relativeDate}</p>
        </div>
      </div>
    </div>
  );
}

export default LogCard;
