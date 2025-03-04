import MediaNavbar from './MediaNavbar';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { getMediaFn } from '../api/trackerApi';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { OutletMediaContextType } from '../types';
import { useEffect } from 'react';

export default function MediaHeader() {
  const { mediaType, mediaId } = useParams<{
    mediaType: string;
    mediaId: string;
  }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      mediaType !== 'anime' &&
      mediaType !== 'manga' &&
      mediaType !== 'vn' &&
      mediaType !== 'video' &&
      mediaType !== 'reading'
    ) {
      navigate('/404');
    }
  }, [mediaType, navigate]);

  const {
    data: media,
    error: mediaError,
    isLoading: isLoadingMedia,
  } = useQuery({
    queryKey: ['media', mediaId],
    queryFn: () => getMediaFn(mediaId!),
    refetchOnMount: 'always',
  });

  if (mediaError) {
    if (mediaError instanceof AxiosError) {
      if (mediaError.status === 404) navigate('/404', { replace: true });
      toast.error(mediaError.response?.data.message);
    } else {
      toast.error(
        mediaError.message ? mediaError.message : 'An error occurred'
      );
    }
  }

  const renderDescription = (description: string) => {
    const cleanedDescription = description.replace(/<br\s*\/?>/gi, '');
    return cleanedDescription.split('\n').map((line, index) => (
      <p key={index}>
        {line}
        <br />
      </p>
    ));
  };

  return (
    <div className="flex flex-col justify-center bg-base-200 text-base-content">
      <div
        className={`h-96 w-full bg-cover bg-center bg-no-repeat ${
          isLoadingMedia ? 'skeleton' : ''
        }`}
        style={{
          backgroundImage: `url(${!isLoadingMedia ? media?.coverImage : ''})`,
        }}
      >
        <div className="flex flex-col justify-end size-full bg-gradient-to-t from-shadow/[0.6] to-40% bg-cover" />
      </div>

      <div className="min-h-12 bg-base-100">
        <div className="grid grid-cols-[215px_auto] min-w-80 px-5 md:px-7 lg:max-w-6xl lg:px-12 2xl:px-24 mx-auto w-full">
          <div>
            <div className="w-52 -mt-32">
              <img
                className="drop-shadow-md"
                src={media?.contentImage ? media.contentImage : ''}
              />
            </div>
            <button className="btn btn-block btn-primary mt-2">Log</button>
          </div>
          <div className="py-22px px-25px">
            <h1 className="text-xl font-bold inline-block text-base-content">
              {media?.title.contentTitleNative}
            </h1>
            <div className="text-base-content text-opacity-75 mt-2">
              {media?.description && renderDescription(media.description)}
            </div>
          </div>
        </div>
      </div>

      <MediaNavbar mediaName={media?.title.contentTitleNative} />
      <Outlet
        context={
          { mediaDocument: media, mediaType } satisfies OutletMediaContextType
        }
      />
    </div>
  );
}
