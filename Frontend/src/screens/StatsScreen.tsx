import { useQuery } from '@tanstack/react-query';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getUserLogsFn } from '../api/authApi';
import { useOutletContext } from 'react-router-dom';
import { OutletContextType } from '../types';
import { ILog } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

function StatsScreen() {
  const { user, username } = useOutletContext<OutletContextType>();
  const totalHours =
    user &&
    user.stats &&
    (user.stats.readingTime + user.stats.listeningTime) / 60;

  const { data: logs } = useQuery({
    queryKey: ['logs'],
    queryFn: ({ pageParam }) =>
      getUserLogsFn(username as string, {
        limit: 0,
        page: pageParam as number,
      }),
    staleTime: Infinity,
  });

  const data = {
    labels: [
      'Reading',
      'Anime',
      'Visual Novel',
      'Video',
      'Light Novel',
      'Manga',
      'Audio',
    ],
    datasets: [
      {
        label: 'Count',
        data: [
          logs?.filter((log: ILog) => log.type === 'reading').length,
          logs?.filter((log: ILog) => log.type === 'anime').length,
          logs?.filter((log: ILog) => log.type === 'vn').length,
          logs?.filter((log: ILog) => log.type === 'video').length,
          logs?.filter((log: ILog) => log.type === 'ln').length,
          logs?.filter((log: ILog) => log.type === 'manga').length,
          logs?.filter((log: ILog) => log.type === 'audio').length,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <div className="flex flex-row justify-around">
        <div>
          <h2 className="text-xl font-bold text-primary">
            {user?.stats.userXp}
          </h2>
          <h4>Total XP</h4>
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary">{totalHours}h</h2>
          <h4>Total Hours</h4>
        </div>
      </div>
      <div className="">
        <Pie
          options={{ responsive: true, maintainAspectRatio: false }}
          data={data}
        />
      </div>
    </>
  );
}

export default StatsScreen;
