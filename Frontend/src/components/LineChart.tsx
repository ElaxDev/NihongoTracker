import { Line } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  Point,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function LineChart({
  data,
}: {
  data: ChartData<'line', (number | Point | null)[], unknown>;
}) {
  return (
    <Line
      options={{
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false, axis: 'xy' },
        plugins: { legend: { position: 'right' } },
        scales: {
          x: {
            title: { display: true },
          },
        },
      }}
      data={data}
    />
  );
}

export default LineChart;
