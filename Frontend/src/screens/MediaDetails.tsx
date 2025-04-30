import { useOutletContext } from 'react-router-dom';
import { OutletMediaContextType } from '../types';

function MediaDetails() {
  const { mediaDocument, mediaType } =
    useOutletContext<OutletMediaContextType>();

  return (
    <div>
      <div className="w-full grid grid-cols-[208px_auto] gap-10 mt-7 px-12 lg:max-w-6xl lg:px-12 2xl:px-24 mx-auto">
        <div className="card bg-base-100 p-4">
          <div className="flex flex-col gap-2 card-body">
            <p className="capitalize font-bold">Type</p>
            <p>{mediaType}</p>
            {mediaType === 'anime' && (
              <>
                <p className="capitalize font-bold">Episodes</p>
                <p>{mediaDocument?.episodes}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaDetails;
