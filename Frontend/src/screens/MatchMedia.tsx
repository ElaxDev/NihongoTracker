import { useQuery } from '@tanstack/react-query';
import { getUserLogsFn } from '../api/trackerApi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { AxiosError } from 'axios';
import { useUserDataStore } from '../store/userData';
import Tabs from '../components/Tabs';
import AnimeLogs from '../components/AnimeLogs';
import VNLogs from '../components/VNLogs';
import MangaLogs from '../components/MangaLogs';
import ReadingLogs from '../components/ReadingLogs';

function AssignMedia() {
  const { user } = useUserDataStore();

  const {
    data: logs,
    error: logError,
    isLoading: isLoadingLogs,
  } = useQuery({
    queryKey: ['logsAssign', user?.username],
    queryFn: () => getUserLogsFn(user?.username as string, { limit: 0 }),
    staleTime: Infinity,
  });

  if (logError && logError instanceof AxiosError) {
    toast.error(logError.response?.data.message);
  }

  return (
    <div className="pt-24 py-16 flex flex-col justify-center items-center bg-base-200 min-h-screen">
      <div className="w-full">
        {isLoadingLogs ? (
          <Loader />
        ) : logError ? (
          <div>Error loading logs</div>
        ) : null}
        <Tabs
          tabs={[
            { label: 'Anime', component: <AnimeLogs logs={logs} /> },
            { label: 'Manga', component: <MangaLogs logs={logs} /> },
            { label: 'VN', component: <VNLogs logs={logs} /> },
            { label: 'Reading', component: <ReadingLogs logs={logs} /> },
          ]}
        />
      </div>
    </div>
  );
}

export default AssignMedia;
