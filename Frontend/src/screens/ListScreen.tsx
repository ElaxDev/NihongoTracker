import { Link, useOutletContext } from 'react-router-dom';
import { OutletContextType } from '../types';
import { getImmersionListFn } from '../api/trackerApi';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

function ListScreen() {
  const { username } = useOutletContext<OutletContextType>();
  const [currentList, setCurrentList] = useState<
    'anime' | 'manga' | 'vn' | 'video' | 'reading'
  >('anime');

  const {
    data: list,
    // error: listError,
    // refetch: refetchList,
  } = useQuery({
    queryKey: ['list', username],
    queryFn: () => getImmersionListFn(username as string),
  });
  return (
    <div>
      <div className="min-w-96 m-10">
        <div className="w-full grid grid-cols-[20%_80%] gap-4">
          <div className="card bg-base-100 p-4">
            <div className="prose-h4">Lists</div>
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

          <div className="card bg-base-100 p-4 flex flex-row">
            {list &&
              list.map((item, index) => {
                return (
                  <div key={index} className="flex flex-row gap-2">
                    {Object.entries(item[currentList]).map(([key, value]) => (
                      <div key={key}>
                        <Link to={`/${currentList}/${value._id}`}>
                          <img
                            src={
                              value.picture ||
                              `https://t.vndb.org/${value.image.substring(
                                0,
                                2
                              )}/${
                                value.image.substring(2) % 100
                              }/${value.image.substring(2)}.jpg`
                            }
                            className="transition hover:shadow-md rounded-md duration-300 h-52 w-full"
                          />
                        </Link>
                      </div>
                    ))}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListScreen;
