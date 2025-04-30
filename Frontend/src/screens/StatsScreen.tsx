import { useQuery } from '@tanstack/react-query';
import { getUserLogsFn } from '../api/trackerApi';
import { useOutletContext } from 'react-router-dom';
import { OutletProfileContextType } from '../types';
import { ILog } from '../types';
import PieChart from '../components/PieChart';
import LineChart from '../components/LineChart';
import { ChartArea, ScriptableContext } from 'chart.js';

function StatsScreen() {
  const { user, username } = useOutletContext<OutletProfileContextType>();

  const totalHours =
    user &&
    user.stats &&
    Number((user.stats.readingTime + user.stats.listeningTime) / 60).toFixed(1);

  const { data: logs } = useQuery({
    queryKey: ['logs'],
    queryFn: () =>
      getUserLogsFn(username as string, {
        limit: 0,
        page: 1,
      }),
    staleTime: Infinity,
  });

  const logTypes = [
    'reading',
    'anime',
    'vn',
    'video',
    'manga',
    'audio',
    'other',
  ];

  const logCountData = {
    labels: logTypes,
    datasets: [
      {
        label: 'Count',
        data: [
          logs?.filter((log: ILog) => log.type === 'reading').length ?? 0,
          logs?.filter((log: ILog) => log.type === 'anime').length ?? 0,
          logs?.filter((log: ILog) => log.type === 'vn').length ?? 0,
          logs?.filter((log: ILog) => log.type === 'video').length ?? 0,
          logs?.filter((log: ILog) => log.type === 'manga').length ?? 0,
          logs?.filter((log: ILog) => log.type === 'audio').length ?? 0,
          logs?.filter((log: ILog) => log.type === 'other').length ?? 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const untrackedLogs = [];

  const timeSpentData = logTypes.map(
    (logType) =>
      logs
        ?.filter((log: ILog) => log.type === logType)
        .reduce((total, log) => {
          if (log.type === 'anime' && log.time) {
            return total + log.time / 60;
          } else if (log.type === 'anime' && !log.time) {
            if (log.episodes) {
              return total + (log.episodes * 24) / 60;
            } else {
              untrackedLogs.push(log);
              return total;
            }
          } else {
            if (log.time) {
              return total + log.time / 60;
            } else {
              untrackedLogs.push(log);
              return total;
            }
          }
        }, 0) ?? 0
  );

  const logTimeData = {
    labels: logTypes,
    datasets: [
      {
        label: 'Time Spent (hours)',
        data: timeSpentData,
        backgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86,1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const logXpData = {
    labels: logTypes,
    datasets: [
      {
        label: 'Xp',
        data: [
          logs
            ?.filter((log: ILog) => log.type === 'reading')
            .reduce((acc, log) => acc + log.xp, 0) ?? 0,
          logs
            ?.filter((log: ILog) => log.type === 'anime')
            .reduce((acc, log) => acc + log.xp, 0) ?? 0,
          logs
            ?.filter((log: ILog) => log.type === 'vn')
            .reduce((acc, log) => acc + log.xp, 0) ?? 0,
          logs
            ?.filter((log: ILog) => log.type === 'video')
            .reduce((acc, log) => acc + log.xp, 0) ?? 0,
          logs
            ?.filter((log: ILog) => log.type === 'manga')
            .reduce((acc, log) => acc + log.xp, 0) ?? 0,
          logs
            ?.filter((log: ILog) => log.type === 'audio')
            .reduce((acc, log) => acc + log.xp, 0) ?? 0,
          logs
            ?.filter((log: ILog) => log.type === 'other')
            .reduce((acc, log) => acc + log.xp, 0) ?? 0,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(99, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  function filterLogsForPeriod(logs: ILog[]) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const logsForPeriod = logs.filter((log) => {
      const logDate = new Date(log.date);
      return logDate.getFullYear() === currentYear;
    });
    return logsForPeriod;
  }

  function getReadingSpeed(
    logs: ILog[],
    types: string[] = ['reading', 'manga', 'vn']
  ) {
    const filteredLogs = filterLogsForPeriod(logs);
    const readingSpeeds: { [key: number]: { sum: number; count: number } } = {};
    filteredLogs.forEach((log) => {
      const month = new Date(log.date).getMonth();
      if (log.type === 'manga')
        console.log(
          'chars',
          log.chars,
          'time',
          log.time,
          'speed',
          log.chars ?? 0 / (log.time ?? 0 / 60)
        );
      if (!types.includes(log.type)) return;
      if (!log.chars || !log.time) return;
      const LogReadingSpeed = log.chars / (log.time / 60);
      if (!readingSpeeds[month]) {
        readingSpeeds[month] = { sum: 0, count: 0 };
      }
      readingSpeeds[month].sum += LogReadingSpeed;
      readingSpeeds[month].count++;
    });
    return Object.keys(readingSpeeds).map((month) => ({
      month: parseInt(month),
      averageSpeed:
        readingSpeeds[parseInt(month)].sum /
        readingSpeeds[parseInt(month)].count,
    }));
  }

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  function createGradient(
    ctx: CanvasRenderingContext2D,
    chartArea: ChartArea,
    color: string
  ) {
    const { top, bottom } = chartArea;
    const gradient = ctx.createLinearGradient(0, top, 0, bottom);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(50, 170, 250, 0)');
    return gradient;
  }
  const readingSpeedsManga = getReadingSpeed(logs ?? [], ['manga']);
  const readingSpeedsVn = getReadingSpeed(logs ?? [], ['vn']);
  const readingSpeedsReading = getReadingSpeed(logs ?? [], ['reading']);

  function completeData(speedArray: { month: number; averageSpeed: number }[]) {
    const readingSpeed = speedArray.map((speed) => speed.averageSpeed);
    if (readingSpeed.length < 12) {
      for (
        let i = readingSpeed.length;
        i < months.slice(0, new Date().getMonth() + 1).length;
        i++
      ) {
        readingSpeed.push(0);
      }
    }
    return readingSpeed;
  }

  const readingSpeedData = {
    labels: months.slice(0, new Date().getMonth() + 1),
    datasets: [
      {
        label: 'Reading Speed (manga)',
        data: completeData(readingSpeedsManga),
        fill: true,
        pointRadius: 3,
        borderColor: 'rgb(50, 170, 250)',
        backgroundColor: function (context: ScriptableContext<'line'>) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          return createGradient(ctx, chartArea, 'rgba(50, 170, 250, 1)');
        },
        tension: 0.1,
      },
      {
        label: 'Reading Speed (visual novels)',
        data: completeData(readingSpeedsVn),
        fill: true,
        pointRadius: 3,
        borderColor: 'rgb(250, 50, 170)',
        backgroundColor: function (context: ScriptableContext<'line'>) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          return createGradient(ctx, chartArea, 'rgb(250, 50, 170)');
        },
        tension: 0.1,
      },
      {
        label: 'Reading Speed (reading)',
        data: completeData(readingSpeedsReading),
        fill: true,
        pointRadius: 3,
        borderColor: 'rgb(50, 250, 170)',
        backgroundColor: function (context: ScriptableContext<'line'>) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;
          return createGradient(ctx, chartArea, 'rgb(50, 250, 170)');
        },
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="2xl:max-w-(--breakpoint-2xl) 2xl:min-w-[50%] min-w-full 2xl:px-0 px-10 mb-24 mt-4">
      <div className="grid lg:grid-cols-[20%_80%] gap-5">
        <div className="hidden lg:block">
          <h2>Sidebar</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-around">
            <div>
              <h2 className="text-xl font-bold text-primary">
                {user?.stats.userXp} XP
              </h2>
              <h4>Total XP</h4>
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">{totalHours}h</h2>
              <h4>Total Hours</h4>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row justify-center gap-7">
            <div className="card bg-base-100 p-4">
              <div className="max-h-64 max-w-64">
                <h2 className="text-2xl font-bold text-primary">Log Count</h2>
                <PieChart data={logCountData} />
              </div>
            </div>
            <div className="card bg-base-100 p-4">
              <div className=" max-h-64 max-w-64">
                <h2 className="text-2xl font-bold text-primary">Log Hours</h2>
                <p
                  className="text-sm text-base-content"
                  // hidden={untrackedLogs.length === 0}
                  hidden={true}
                >{`${untrackedLogs.length} untracked logs`}</p>
                <PieChart data={logTimeData} />
              </div>
            </div>
            <div className="card bg-base-100 p-4">
              <div className=" max-h-64 max-w-64">
                <h2 className="text-2xl font-bold text-primary">Log XP</h2>
                <p
                  className="text-sm text-base-content"
                  // hidden={untrackedLogs.length === 0}
                  hidden={true}
                >{`${untrackedLogs.length} untracked logs`}</p>
                <PieChart data={logXpData} />
              </div>
            </div>
          </div>
          <div className="card bg-base-100 max-h-80 grow p-8 mb-4">
            <div className="h-full w-full">
              <h2 className="text-2xl font-bold text-primary mb-2">
                Reading Speed
              </h2>
              <div className="h-full w-full">
                <LineChart data={readingSpeedData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsScreen;
