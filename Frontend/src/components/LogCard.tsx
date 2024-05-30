// import { Link } from 'react-router-dom';
import { ILog } from '../types';
import { DateTime } from 'luxon';

const logTypeText = {
  reading: 'Reading',
  anime: 'Anime',
  vn: 'Visual Novel',
  video: 'Video',
  ln: 'Light Novel',
  manga: 'Manga',
  audio: 'Audio',
};

function LogCard({ log }: { log: ILog }) {
  const { description, xp, date, type, episodes, pages, time, chars } = log;
  const relativeDate = date ? DateTime.fromISO(date).toRelative() : date;

  function renderQuantity() {
    if (type === 'anime') {
      return <p>Episodes: {episodes}</p>;
    } else if (type === 'manga') {
      return <p>Pages: {pages}</p>;
    } else if (type === 'vn' || type === 'ln' || type === 'reading') {
      if (chars) {
        return <p>Character count:{chars}</p>;
      } else if (time) {
        return <p>Time: {time > 60 ? `${time / 60}h` : `${time}m`}</p>;
      }
    } else if ((type === 'video' || type === 'audio') && time) {
      return <p>Time: {time / 60}</p>;
    } else {
      return null;
    }
  }

  return (
    <div className="card grid-cols-2 h-full w-full min-h-8 bg-base-100 text-base-content shadow-xl">
      {/* <Link
          to="#"
          className="h-full bg-center bg-no-repeat bg-cover w-12"
          style={{
            backgroundImage:
              'url(https://img.daisyui.com/images/stock/photo-1635805737707-575885ab0820.jpg)',
          }}
        /> */}
      <div className="card-body">
        <h2 className="card-title">{description}</h2>
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
