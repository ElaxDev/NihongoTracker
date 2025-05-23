import { Link, useOutletContext } from 'react-router-dom';
import { IImmersionList, OutletProfileContextType } from '../types';
import { getImmersionListFn, getUntrackedLogsFn } from '../api/trackerApi';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

function ListScreen() {
  const { username } = useOutletContext<OutletProfileContextType>();
  const [currentList, setCurrentList] = useState<keyof IImmersionList>('anime');

  const {
    data: list,
    error: listError,
    isLoading: listLoading,
  } = useQuery({
    queryKey: ['ImmersionList', username],
    queryFn: () => getImmersionListFn(username as string),
  });

  const { data: untrackedLogs } = useQuery({
    queryKey: ['untrackedLogs', username],
    queryFn: () => getUntrackedLogsFn(),
  });

  if (listError) {
    toast.error(listError.message);
  }

  return (
    <div>
      <div className="min-w-96 m-10">
        <div className="w-full grid grid-cols-[20%_80%] gap-4">
          <div className="card bg-base-100 p-4">
            <div className="font-bold text-xl">Lists</div>
            <ul className="menu card-body">
              <li className="capitalize">
                <a onClick={() => setCurrentList('anime')}>Anime</a>
              </li>
              <li className="capitalize">
                <a onClick={() => setCurrentList('manga')}>Manga</a>
              </li>
              <li className="capitalize">
                <a onClick={() => setCurrentList('vn')}>Visual Novel</a>
              </li>
              <li className="capitalize">
                <a onClick={() => setCurrentList('video')}>Video</a>
              </li>
              <li className="capitalize">
                <a onClick={() => setCurrentList('reading')}>Reading</a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            {untrackedLogs && untrackedLogs.length > 0 && (
              <div className="alert alert-info shadow-lg">
                <div className="flex flex-row gap-2 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>
                    You have {untrackedLogs.length} unmatched logs.{' '}
                    {
                      <Link className="link" to="/matchmedia">
                        Click here
                      </Link>
                    }{' '}
                    to match them!
                  </span>
                </div>
              </div>
            )}
            <div className="card bg-base-100 p-4 flex flex-row">
              <div className="flex flex-row flex-wrap gap-2 w-full">
                {listLoading ? (
                  <div className="flex justify-center items-center w-full h-full">
                    <Loader />
                  </div>
                ) : list &&
                  list[currentList] &&
                  list[currentList].length > 0 ? (
                  list[currentList].map((item, index) => (
                    <div key={index}>
                      <Link
                        to={`/${currentList}/${item.contentId}`}
                        className="w-52 h-52"
                      >
                        <img
                          src={item.contentImage}
                          alt={item.title.contentTitleNative}
                          className="transition hover:shadow-md rounded-md duration-300 h-52 w-full"
                        />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center w-full h-full">
                    <div className="flex flex-col items-center">
                      <p className="text-center">
                        {'No elements in this list.'}
                      </p>
                      <p className="text-center">
                        {'Go immerse to fill it up!'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListScreen;
