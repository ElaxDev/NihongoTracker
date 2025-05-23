import { Line } from "react-chartjs-2";

import {
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  Point,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

function LineChart({
  data,
}: {
  data: ChartData<"line", (number | Point | null)[]>;
}) {
  return (
    <Line
      options={{
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false, axis: "xy" },
        plugins: { legend: { position: "right" } },
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
