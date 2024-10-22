import { useOutletContext } from 'react-router-dom';
import { OutletContextType } from '../types';
import { getImmersionListFn } from '../api/trackerApi';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

function ListScreen() {
  const { username } = useOutletContext<OutletContextType>();
  const [currentList, setCurrentList] = useState<string>('anime');

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
      <div className="card min-w-96 bg-base-100 m-10">
        <div className="card-body w-full grid grid-cols-[20%_80%]">
          <div className="">
            <div className="prose-h4">Lists</div>
            <ul className="menu">
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
          <div className="">
            <div className="flex flex-row">
              {list &&
                list.map((item, index) => {
                  return (
                    <div key={index} className="flex flex-row gap-2">
                      {Object.entries(item[currentList]).map(([key, value]) => (
                        <div key={key}>
                          <img
                            src={value.picture}
                            className="transition hover:shadow-md rounded-sm duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListScreen;
