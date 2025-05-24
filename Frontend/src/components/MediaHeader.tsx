// import MediaNavbar from './MediaNavbar';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { getAverageColorFn, getMediaFn } from '../api/trackerApi';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { OutletMediaContextType } from '../types';
import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { convertBBCodeToHtml } from '../utils/utils';
import QuickLog from '../components/QuickLog';

export default function MediaHeader() {
  const { mediaType, mediaId } = useParams<{
    mediaType: string;
    mediaId: string;
  }>();
  const navigate = useNavigate();
  const [averageColor, setAverageColor] = useState<string>('#ffffff');
  const [logModalOpen, setLogModalOpen] = useState(false);

  const {
    data: media,
    error: mediaError,
    isLoading: isLoadingMedia,
  } = useQuery({
    queryKey: ['media', mediaId, mediaType],
    queryFn: () => getMediaFn(mediaId, mediaType),
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
    // First check if it contains BBCode tags
    if (/\[(b|i|u|s|url|img|spoiler|quote|code|list|\*)\b/i.test(description)) {
      // Convert BBCode to HTML
      const htmlFromBBCode = convertBBCodeToHtml(description);

      // Then sanitize and render the HTML
      const sanitizedDescription = DOMPurify.sanitize(
        htmlFromBBCode.replace(/<br\s*\/?>/gi, '<br />')
      );
      return <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />;
    }

    // Check for regular HTML
    if (!/<[a-z][\s\S]*>/i.test(description)) {
      // No HTML tags, render as plain text
      return description.split('\n').map((line, index) => (
        <p key={index}>
          {line}
          <br />
        </p>
      ));
    }

    // Render HTML safely
    const sanitizedDescription = DOMPurify.sanitize(
      description.replace(/<br\s*\/?>/gi, '<br />')
    );
    return <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />;
  };

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
  }, [mediaType, navigate, media]);

  useEffect(() => {
    async function getAvgColor() {
      if (media?.contentImage) {
        const color = await getAverageColorFn(media?.contentImage);
        if (color) {
          return setAverageColor(color.hex);
        }
        setAverageColor('#ffffff');
      }
    }

    void getAvgColor();
  }, [media]);

  return (
    <div className="flex flex-col justify-center bg-base-200 text-base-content">
      <QuickLog
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        media={media}
      />
      <div
        className={`h-96 w-full bg-cover bg-center bg-no-repeat ${
          isLoadingMedia ? 'skeleton' : ''
        }`}
        style={{
          backgroundImage: `url(${!isLoadingMedia ? media?.coverImage : ''})`,
          backgroundColor: averageColor,
        }}
      >
        {media?.coverImage ? (
          <div className="flex flex-col justify-end size-full bg-linear-to-t from-shadow/[0.6] to-40% bg-cover" />
        ) : (
          <></>
        )}
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
            <button
              className="btn w-52 btn-primary mt-2"
              onClick={() => setLogModalOpen(true)}
            >
              Log
            </button>
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

      {/* <MediaNavbar mediaName={media?.title.contentTitleNative} /> */}
      <Outlet
        context={
          { mediaDocument: media, mediaType } satisfies OutletMediaContextType
        }
      />
    </div>
  );
}
