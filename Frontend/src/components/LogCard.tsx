// import { Link } from 'react-router-dom';
import { ILog } from '../types';
import { DateTime } from 'luxon';

function LogCard({ log }: { log: ILog }) {
  const { description, xp, date } = log;
  const relativeDate = date ? DateTime.fromISO(date).toRelative() : date;
  return (
    <>
      <div className="card grid-cols-2 h-full min-h-8 bg-base-200 shadow-xl">
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
          <div className="flex justify-between w-full">
            <p>XP: {xp}</p>
            <p className="text-right">{relativeDate}</p>
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
}

export default LogCard;
