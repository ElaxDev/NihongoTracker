import { Link, useOutletContext } from 'react-router-dom';
import { IImmersionList, OutletProfileContextType } from '../types';
import { getImmersionListFn, getUntrackedLogsFn } from '../api/trackerApi';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useUserDataStore } from '../store/userData';

function ListScreen() {
  const { username } = useOutletContext<OutletProfileContextType>();
  const { user } = useUserDataStore();
  const [currentList, setCurrentList] = useState<keyof IImmersionList>('anime');

  const {
    data: list,
    error: listError,
    isLoading: listLoading,
  } = useQuery({
    queryKey: ['ImmersionList', username, currentList],
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
    <div className="px-4 py-6 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 md:gap-6">
          {/* Sidebar with lists */}
          <div className="card bg-base-100 shadow-sm">
            <div className="p-4 border-b border-base-200">
              <div className="font-bold text-xl">Lists</div>
            </div>
            <ul className="menu menu-md p-2 w-full">
              {['anime', 'manga', 'vn', 'video', 'reading'].map((item) => (
                <li key={item} className="capitalize">
                  <a
                    onClick={() => setCurrentList(item as keyof IImmersionList)}
                    className={currentList === item ? 'active' : ''}
                  >
                    {item === 'vn' ? 'Visual Novel' : item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Main content area */}
          <div className="flex flex-col gap-4">
            {untrackedLogs &&
              untrackedLogs.length > 0 &&
              username === user?.username && (
                <div className="alert alert-info shadow-sm">
                  <div className=" flex flex-row items-center gap-2">
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
                      <Link className="link" to="/matchmedia">
                        Click here
                      </Link>{' '}
                      to match them!
                    </span>
                  </div>
                </div>
              )}
            <div className="card bg-base-100 shadow-sm">
              <div className="p-4 border-b border-base-200">
                <h2 className="font-bold text-xl capitalize">{currentList}</h2>
              </div>
              <div className="p-4">
                {list && list[currentList] && list[currentList].length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {list[currentList].map((item, index) => (
                      <div key={index} className="flex flex-col">
                        <Link
                          to={`/${currentList}/${item.contentId}`}
                          className="h-auto w-full aspect-[3/4] rounded-md overflow-hidden"
                        >
                          <img
                            src={item.contentImage}
                            alt={item.title.contentTitleNative}
                            className="transition hover:shadow-md rounded-md duration-300 w-full h-full object-cover"
                          />
                        </Link>
                        <div className="mt-2 text-sm text-center truncate">
                          {item.title.contentTitleEnglish ||
                            item.title.contentTitleRomaji ||
                            item.title.contentTitleNative}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : listLoading ? (
                  <div className="flex justify-center items-center w-full h-40">
                    <Loader />
                  </div>
                ) : (
                  <div className="flex justify-center items-center w-full py-10">
                    <div className="flex flex-col items-center">
                      <p className="text-center">No elements in this list.</p>
                      <p className="text-center">Go immerse to fill it up!</p>
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
